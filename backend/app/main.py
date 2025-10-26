
from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi import Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional, Any
import asyncio
import json
from datetime import datetime

from .core.simulator import QKDSimulator, SimulationParameters, SimulationResult
from .core.attack_models import AttackType
from .core.secure_messaging_service import create_secure_messaging_service
from .models.schemas import (
    SimulationRequest, SimulationResponse, SimulationStatus,
    ParameterSweepRequest, AttackSimulationRequest, DashboardData
)
from .config import settings

app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

simulator = QKDSimulator()
messaging_service = create_secure_messaging_service(simulator)
background_tasks: Dict[str, Dict] = {}
active_connections: List[WebSocket] = []


@app.get("/")
async def root():
    return {
        "message": "QKD Simulator API",
        "version": "1.0.0",
        "endpoints": [
            "/docs",
            "/simulate/bb84",
            "/simulate/status/{simulation_id}",
            "/simulate/history",
            "/metrics/qber",
            "/attack/simulate",
            "/dashboard/data",
            "/messaging/keys/generate",
            "/messaging/keys/shared/generate",
            "/messaging/keys/{user_id}",
            "/messaging/keys/{user_id}/refresh",
            "/messaging/keys/statistics",
            "/messaging/send",
            "/messaging/receive",
            "/messaging/messages/{user_id}",
            "/messaging/messages/{message_id}/details",
            "/messaging/statistics",
            "/messaging/clear-expired"
        ]
    }


@app.post("/simulate/bb84", response_model=SimulationResponse)
async def run_bb84_simulation(request: SimulationRequest):
    try:
        params = SimulationParameters(
            num_qubits=request.num_qubits,
            channel_length=request.channel_length,
            channel_attenuation=request.channel_attenuation,
            channel_depolarization=request.channel_depolarization,
            photon_source_efficiency=request.photon_source_efficiency,
            detector_efficiency=request.detector_efficiency,
            attack_type=AttackType(request.attack_type) if request.attack_type else AttackType.NO_ATTACK,
            attack_parameters=request.attack_parameters or {},
            use_advanced_reconciliation=request.use_advanced_reconciliation,
            reconciliation_method=request.reconciliation_method,
            use_advanced_privacy_amplification=request.use_advanced_privacy_amplification,
            privacy_amplification_method=request.privacy_amplification_method,
            use_decoy_states=request.use_decoy_states,
            decoy_state_parameters=request.decoy_state_parameters or {}
        )
        
        result = simulator.run_simulation(params)
        
        return SimulationResponse(
            simulation_id=result.simulation_id,
            status="completed",
            message="Simulation completed successfully",
            timestamp=result.timestamp,
            results_summary={
                "final_key_length": result.bb84_result.final_key_length,
                "qber": result.bb84_result.qber,
                "attack_detected": result.attack_detection["attack_detected"] if result.attack_detection else False
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@app.post("/simulate/bb84/async", response_model=SimulationResponse)
async def run_bb84_simulation_async(request: SimulationRequest, bg_tasks: BackgroundTasks):
    """
    Run BB84 protocol simulation asynchronously
    
    Args:
        request: Simulation parameters
        bg_tasks: FastAPI background tasks
        
    Returns:
        Simulation response with ID for status checking
    """
    try:

        params = SimulationParameters(
            num_qubits=request.num_qubits,
            channel_length=request.channel_length,
            channel_attenuation=request.channel_attenuation,
            channel_depolarization=request.channel_depolarization,
            photon_source_efficiency=request.photon_source_efficiency,
            detector_efficiency=request.detector_efficiency,
            attack_type=AttackType(request.attack_type) if request.attack_type else AttackType.NO_ATTACK,
            attack_parameters=request.attack_parameters or {}
        )
        

        simulation_id = f"qkd_sim_{int(asyncio.get_event_loop().time())}_{hash(str(params))}"
        

        global background_tasks
        background_tasks[simulation_id] = {
            "status": "running",
            "parameters": params,
            "start_time": asyncio.get_event_loop().time()
        }
        

        bg_tasks.add_task(run_simulation_background, simulation_id, params)
        
        return SimulationResponse(
            simulation_id=simulation_id,
            status="running",
            message="Simulation started in background",
            timestamp=asyncio.get_event_loop().time(),
            results_summary={}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start simulation: {str(e)}")


async def run_simulation_background(simulation_id: str, params: SimulationParameters):
    """Background task for running simulation with real-time updates"""
    try:
        background_tasks[simulation_id]["status"] = "running"
        await broadcast_update({
            "type": "simulation_update",
            "simulation_id": simulation_id,
            "status": "running",
            "progress": 0
        })
        
        phases = [
            ("initialization", 10),
            ("quantum_transmission", 30),
            ("basis_announcement", 40),
            ("sifting", 50),
            ("error_estimation", 60),
            ("reconciliation", 80),
            ("privacy_amplification", 95),
            ("completed", 100)
        ]
        
        for phase, progress in phases:
            await asyncio.sleep(0.5)
            background_tasks[simulation_id]["current_phase"] = phase
            await broadcast_update({
                "type": "simulation_update",
                "simulation_id": simulation_id,
                "status": "running",
                "progress": progress,
                "phase": phase
            })
        
        result = simulator.run_simulation(params, simulation_id)
        
        background_tasks[simulation_id].update({
            "status": "completed",
            "result": result,
            "end_time": asyncio.get_event_loop().time()
        })
        
        await broadcast_update({
            "type": "simulation_complete",
            "simulation_id": simulation_id,
            "result": result.to_dict()
        })
        
    except Exception as e:
        background_tasks[simulation_id].update({
            "status": "failed",
            "error": str(e),
            "end_time": asyncio.get_event_loop().time()
        })
        
        await broadcast_update({
            "type": "simulation_error",
            "simulation_id": simulation_id,
            "error": str(e)
        })


async def broadcast_update(message: Dict[str, Any]):
    """Broadcast real-time updates to all connected clients"""
    if not active_connections:
        return
    
    message_str = json.dumps(message)
    disconnected = []
    
    for connection in active_connections:
        try:
            await connection.send_text(message_str)
        except:
            disconnected.append(connection)
    
    for connection in disconnected:
        active_connections.remove(connection)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                
    except WebSocketDisconnect:
        active_connections.remove(websocket)


@app.get("/simulate/status/{simulation_id}", response_model=SimulationStatus)
async def get_simulation_status(simulation_id: str):
    """
    Get simulation status and results
    
    Args:
        simulation_id: ID of the simulation
        
    Returns:
        Simulation status and results
    """

    if simulation_id in background_tasks:
        task_info = background_tasks[simulation_id]
        if task_info["status"] == "completed":
            result = task_info["result"]
            return SimulationStatus(
                simulation_id=simulation_id,
                status="completed",
                progress=100,
                results={
                    "bb84_result": {
                        "raw_key_length": result.bb84_result.raw_key_length,
                        "sifted_key_length": result.bb84_result.sifted_key_length,
                        "final_key_length": result.bb84_result.final_key_length,
                        "qber": result.bb84_result.qber
                    }
                }
            )
        elif task_info["status"] == "failed":
            return SimulationStatus(
                simulation_id=simulation_id,
                status="failed",
                progress=0,
                error=task_info.get("error", "Unknown error")
            )
        else:

            elapsed = asyncio.get_event_loop().time() - task_info["start_time"]
            estimated_duration = 10.0  # Rough estimate
            progress = min(90, int((elapsed / estimated_duration) * 100))
            
            return SimulationStatus(
                simulation_id=simulation_id,
                status="running",
                progress=progress,
                results={}
            )
    

    result = simulator.get_simulation_by_id(simulation_id)
    if result:
        return SimulationStatus(
            simulation_id=simulation_id,
            status="completed",
            progress=100,
            results={
                "bb84_result": {
                    "raw_key_length": result.bb84_result.raw_key_length,
                    "sifted_key_length": result.bb84_result.sifted_key_length,
                    "final_key_length": result.bb84_result.final_key_length,
                    "qber": result.bb84_result.qber
                },
                "attack_detection": result.attack_detection
            }
        )
    
    raise HTTPException(status_code=404, detail="Simulation not found")


@app.get("/simulate/history")
async def get_simulation_history():
    """Get simulation history"""
    try:
        history = simulator.get_simulation_history()
        return {
            "total_simulations": len(history),
            "simulations": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve history: {str(e)}")


@app.post("/simulate/parameter-sweep")
async def run_parameter_sweep(request: ParameterSweepRequest):
    """
    Run multiple simulations with different parameter combinations
    
    Args:
        request: Parameter sweep configuration
        
    Returns:
        List of simulation IDs
    """
    try:

        base_params = SimulationParameters(
            num_qubits=request.base_parameters.num_qubits,
            channel_length=request.base_parameters.channel_length,
            channel_attenuation=request.base_parameters.channel_attenuation,
            channel_depolarization=request.base_parameters.channel_depolarization,
            photon_source_efficiency=request.base_parameters.photon_source_efficiency,
            detector_efficiency=request.base_parameters.detector_efficiency,
            attack_type=AttackType(request.base_parameters.attack_type) if request.base_parameters.attack_type else AttackType.NO_ATTACK,
            attack_parameters=request.base_parameters.attack_parameters or {}
        )
        

        results = simulator.run_parameter_sweep(base_params, request.sweep_parameters)
        
        return {
            "message": f"Parameter sweep completed with {len(results)} simulations",
            "simulation_ids": [result.simulation_id for result in results],
            "total_simulations": len(results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parameter sweep failed: {str(e)}")


@app.get("/metrics/qber")
async def get_qber_metrics():
    """Get QBER metrics from recent simulations"""
    try:
        history = simulator.get_simulation_history()
        if not history:
            return {"message": "No simulations found"}
        

        qber_values = [sim["bb84_result"]["qber"] for sim in history]
        
        return {
            "total_simulations": len(history),
            "average_qber": sum(qber_values) / len(qber_values),
            "min_qber": min(qber_values),
            "max_qber": max(qber_values),
            "recent_qber": qber_values[-10:] if len(qber_values) >= 10 else qber_values
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve QBER metrics: {str(e)}")


@app.post("/attack/simulate")
async def simulate_attack_scenario(request: AttackSimulationRequest):
    """
    Simulate specific attack scenarios
    
    Args:
        request: Attack simulation parameters
        
    Returns:
        Attack simulation results
    """
    try:

        params = SimulationParameters(
            num_qubits=request.num_qubits,
            channel_length=request.channel_length,
            channel_attenuation=request.channel_attenuation,
            attack_type=AttackType(request.attack_type),
            attack_parameters=request.attack_parameters or {}
        )
        

        result = simulator.run_simulation(params)
        
        return {
            "simulation_id": result.simulation_id,
            "attack_type": request.attack_type,
            "attack_detected": result.attack_detection["attack_detected"] if result.attack_detection else False,
            "qber": result.bb84_result.qber,
            "final_key_length": result.bb84_result.final_key_length,
            "attack_details": result.attack_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Attack simulation failed: {str(e)}")


@app.get("/dashboard/data", response_model=DashboardData)
async def get_dashboard_data():
    """Get real-time data for dashboard"""
    try:

        history = simulator.get_simulation_history()
        recent_simulations = history[-10:] if len(history) >= 10 else history
        

        stats = simulator.get_statistics()
        

        if recent_simulations:
            recent_qber = [sim["bb84_result"]["qber"] for sim in recent_simulations]
            recent_key_lengths = [sim["bb84_result"]["final_key_length"] for sim in recent_simulations]
            
            real_time_metrics = {
                "recent_qber_trend": recent_qber,
                "recent_key_lengths": recent_key_lengths,
                "average_qber_last_10": sum(recent_qber) / len(recent_qber),
                "total_key_bits_generated": sum(recent_key_lengths)
            }
        else:
            real_time_metrics = {}
        
        return DashboardData(
            overall_statistics=stats,
            recent_simulations=len(recent_simulations),
            real_time_metrics=real_time_metrics,
            last_updated=asyncio.get_event_loop().time()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve dashboard data: {str(e)}")


@app.get("/simulator/statistics")
async def get_simulator_statistics():
    """Get overall simulator statistics"""
    try:
        stats = simulator.get_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve statistics: {str(e)}")


@app.delete("/simulator/clear-history")
async def clear_simulation_history():
    """Clear simulation history"""
    try:
        simulator.clear_history()
        background_tasks.clear()
        return {"message": "Simulation history cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear history: {str(e)}")




@app.post("/advanced/reconciliation")
async def run_advanced_reconciliation(simulation_id: str, method: str = "cascade"):
    """
    Run advanced reconciliation on existing simulation results
    
    Args:
        simulation_id: ID of the simulation
        method: Reconciliation method (cascade, ldpc, hybrid)
        
    Returns:
        Reconciliation results
    """
    try:
        result = simulator.get_simulation_by_id(simulation_id)
        if not result:
            raise HTTPException(status_code=404, detail="Simulation not found")
        

        params = SimulationParameters(
            num_qubits=result.parameters.num_qubits,
            channel_length=result.parameters.channel_length,
            channel_attenuation=result.parameters.channel_attenuation,
            channel_depolarization=result.parameters.channel_depolarization,
            photon_source_efficiency=result.parameters.photon_source_efficiency,
            detector_efficiency=result.parameters.detector_efficiency,
            attack_type=result.parameters.attack_type,
            attack_parameters=result.parameters.attack_parameters,
            use_advanced_reconciliation=True,
            reconciliation_method=method
        )
        

        new_result = simulator.run_simulation(params)
        
        return {
            "original_simulation_id": simulation_id,
            "new_simulation_id": new_result.simulation_id,
            "reconciliation_method": method,
            "reconciliation_metadata": new_result.bb84_result.reconciliation_metadata,
            "improved_qber": new_result.bb84_result.qber,
            "final_key_length": new_result.bb84_result.final_key_length
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reconciliation failed: {str(e)}")


@app.post("/advanced/privacy-amplification")
async def run_advanced_privacy_amplification(simulation_id: str, method: str = "toeplitz"):
    """
    Run advanced privacy amplification on existing simulation results
    
    Args:
        simulation_id: ID of the simulation
        method: Privacy amplification method (toeplitz, universal, hybrid)
        
    Returns:
        Privacy amplification results
    """
    try:
        result = simulator.get_simulation_by_id(simulation_id)
        if not result:
            raise HTTPException(status_code=404, detail="Simulation not found")
        

        params = SimulationParameters(
            num_qubits=result.parameters.num_qubits,
            channel_length=result.parameters.channel_length,
            channel_attenuation=result.parameters.channel_attenuation,
            channel_depolarization=result.parameters.channel_depolarization,
            photon_source_efficiency=result.parameters.photon_source_efficiency,
            detector_efficiency=result.parameters.detector_efficiency,
            attack_type=result.parameters.attack_type,
            attack_parameters=result.parameters.attack_parameters,
            use_advanced_privacy_amplification=True,
            privacy_amplification_method=method
        )
        

        new_result = simulator.run_simulation(params)
        
        return {
            "original_simulation_id": simulation_id,
            "new_simulation_id": new_result.simulation_id,
            "privacy_amplification_method": method,
            "privacy_amplification_metadata": new_result.bb84_result.privacy_amplification_info,
            "compression_ratio": new_result.bb84_result.privacy_amplification_info.get("compression_ratio", 0.0),
            "final_key_length": new_result.bb84_result.final_key_length
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Privacy amplification failed: {str(e)}")


@app.post("/advanced/decoy-states")
async def run_decoy_state_simulation(simulation_id: str, decoy_parameters: Dict = None):
    """
    Run decoy-state analysis on existing simulation results
    
    Args:
        simulation_id: ID of the simulation
        decoy_parameters: Decoy state parameters
        
    Returns:
        Decoy-state analysis results
    """
    try:
        result = simulator.get_simulation_by_id(simulation_id)
        if not result:
            raise HTTPException(status_code=404, detail="Simulation not found")
        

        params = SimulationParameters(
            num_qubits=result.parameters.num_qubits,
            channel_length=result.parameters.channel_length,
            channel_attenuation=result.parameters.channel_attenuation,
            channel_depolarization=result.parameters.channel_depolarization,
            photon_source_efficiency=result.parameters.photon_source_efficiency,
            detector_efficiency=result.parameters.detector_efficiency,
            attack_type=result.parameters.attack_type,
            attack_parameters=result.parameters.attack_parameters,
            use_decoy_states=True,
            decoy_state_parameters=decoy_parameters or {}
        )
        

        new_result = simulator.run_simulation(params)
        
        return {
            "original_simulation_id": simulation_id,
            "new_simulation_id": new_result.simulation_id,
            "decoy_state_metadata": new_result.bb84_result.decoy_state_metadata,
            "security_improvement": new_result.bb84_result.security_metadata.get("decoy_state_security", 0.0),
            "pns_attack_mitigation": new_result.bb84_result.security_metadata.get("pns_attack_mitigation", "None")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decoy-state analysis failed: {str(e)}")


@app.post("/secure-communication/create-demo")
async def create_secure_communication_demo(simulation_id: str, encryption_mode: str = "GCM", key_length: int = 256):
    """
    Create a secure communication demo using QKD-generated keys
    
    Args:
        simulation_id: ID of the simulation to use for keys
        encryption_mode: AES encryption mode (GCM, CBC, CTR)
        key_length: AES key length (128, 192, 256)
        
    Returns:
        Demo configuration and status
    """
    try:
        result = simulator.create_secure_communication_demo(simulation_id, encryption_mode, key_length)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create demo: {str(e)}")


@app.post("/secure-communication/run-demo")
async def run_secure_communication_demo(messages: List[Dict]):
    """
    Run a secure communication demo
    
    Args:
        messages: List of message dictionaries with 'sender', 'receiver', 'content'
        
    Returns:
        List of communication records
    """
    try:
        result = simulator.run_secure_communication_demo(messages)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo failed: {str(e)}")


@app.get("/secure-communication/stats")
async def get_secure_communication_stats():
    """Get statistics about secure communication demo"""
    try:
        result = simulator.get_secure_communication_stats()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")


@app.post("/secure-communication/export-log")
async def export_secure_communication_log(payload: Dict = Body(...)):
    """Export secure communication log to file"""
    try:
        filepath = payload.get("filepath")
        if not filepath:
            raise HTTPException(status_code=422, detail="Missing 'filepath'")
        success = simulator.export_secure_communication_log(filepath)
        if success:
            return {"message": f"Log exported successfully to {filepath}"}
        else:
            raise HTTPException(status_code=500, detail="Export failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@app.get("/advanced/optimize-decoy-states")
async def optimize_decoy_state_parameters(target_distance: float = 50.0, channel_loss: float = 0.2):
    """
    Optimize decoy-state parameters for maximum key rate
    
    Args:
        target_distance: Target transmission distance in km
        channel_loss: Channel loss per kilometer in dB/km
        
    Returns:
        Optimization results
    """
    try:
        from .core.decoy_states import DecoyStateOptimization
        
        optimizer = DecoyStateOptimization(target_distance, channel_loss)
        results = optimizer.optimize_parameters()
        
        return {
            "target_distance": target_distance,
            "channel_loss": channel_loss,
            "best_parameters": results["best_parameters"],
            "best_key_rate": results["best_key_rate"],
            "optimization_results": results["optimization_results"][:10]  # Return top 10 results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )




@app.get("/messaging/keys/generate")
async def generate_quantum_key(user_id: str, key_length: int = 256):
    """
    Generate a quantum key for a specific user
    
    Args:
        user_id: Unique identifier for the user
        key_length: Desired key length in bits (128, 192, or 256)
        
    Returns:
        Quantum key generation result
    """
    try:
        if key_length not in [128, 192, 256]:
            raise HTTPException(status_code=400, detail="Key length must be 128, 192, or 256 bits")
        
        result = simulator.generate_quantum_key_for_user(user_id, key_length)
        
        if result.get('success', False):
            return {
                "success": True,
                "user_id": user_id,
                "key_length": result['key_length'],
                "key_available": True,
                "expires_at": result['expires_at'],
                "security_metrics": result['security_metrics']
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Key generation failed'))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quantum key: {str(e)}")


@app.get("/messaging/keys/statistics")
async def get_quantum_key_statistics():
    """Get statistics about quantum key generation"""
    try:
        stats = simulator.get_quantum_key_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get key statistics: {str(e)}")


@app.post("/messaging/keys/shared/generate")
async def generate_shared_quantum_key(request: dict = Body(...)):
    """
    Generate a shared quantum key between two users (simulates real QKD)
    
    Args:
        request: Dictionary with user1_id, user2_id, and key_length
        
    Returns:
        Shared quantum key generation result
    """
    try:
        required_fields = ['user1_id', 'user2_id']
        for field in required_fields:
            if field not in request:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        user1_id = request['user1_id']
        user2_id = request['user2_id']
        key_length = request.get('key_length', 256)
        
        if key_length not in [128, 192, 256]:
            raise HTTPException(status_code=400, detail="Key length must be 128, 192, or 256 bits")
        
        result = simulator.generate_shared_quantum_key(user1_id, user2_id, key_length)
        
        if result.get('success', False):
            return result
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Shared key generation failed'))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate shared quantum key: {str(e)}")


@app.get("/messaging/keys/{user_id}")
async def get_user_quantum_key(user_id: str):
    """
    Get the current quantum key for a user
    
    Args:
        user_id: User identifier
        
    Returns:
        User's quantum key information
    """
    try:
        key_data = simulator.get_user_quantum_key(user_id)
        
        if key_data:
            return {
                "user_id": user_id,
                "key_length": key_data['key_length'],
                "key_available": True,
                "expires_at": key_data['expires_at'],
                "security_metrics": {
                    "qber": key_data['qber'],
                    "security_level": key_data['security_level'],
                    "simulation_id": key_data['simulation_id']
                }
            }
        else:
            return {
                "user_id": user_id,
                "key_available": False,
                "message": "No valid quantum key found. Generate one first."
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get quantum key: {str(e)}")


@app.post("/messaging/keys/{user_id}/refresh")
async def refresh_quantum_key(user_id: str, key_length: int = 256):
    """
    Generate a new quantum key for a user
    
    Args:
        user_id: User identifier
        key_length: Desired key length in bits
        
    Returns:
        New quantum key generation result
    """
    try:
        if key_length not in [128, 192, 256]:
            raise HTTPException(status_code=400, detail="Key length must be 128, 192, or 256 bits")
        
        result = simulator.refresh_user_quantum_key(user_id, key_length)
        
        if result.get('success', False):
            return {
                "success": True,
                "user_id": user_id,
                "key_length": result['key_length'],
                "key_available": True,
                "expires_at": result['expires_at'],
                "security_metrics": result['security_metrics']
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Key refresh failed'))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh quantum key: {str(e)}")


@app.post("/messaging/send")
async def send_secure_message(request: dict = Body(...)):
    """
    Send a secure message using quantum keys
    
    Args:
        request: Dictionary with sender_id, receiver_id, message, encryption_mode, key_length
        
    Returns:
        Message sending result
    """
    try:
        required_fields = ['sender_id', 'receiver_id', 'message']
        for field in required_fields:
            if field not in request:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        sender_id = request['sender_id']
        receiver_id = request['receiver_id']
        message = request['message']
        encryption_mode = request.get('encryption_mode', 'GCM')
        key_length = request.get('key_length', 256)
        
        if key_length not in [128, 192, 256]:
            raise HTTPException(status_code=400, detail="Key length must be 128, 192, or 256 bits")
        
        result = messaging_service.send_secure_message(
            sender_id=sender_id,
            receiver_id=receiver_id,
            message=message,
            encryption_mode=encryption_mode,
            key_length=key_length
        )
        
        if result.get('success', False):
            return result
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Message sending failed'))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")


@app.post("/messaging/receive")
async def receive_secure_message(request: dict = Body(...)):
    """
    Receive and decrypt a secure message
    
    Args:
        request: Dictionary with receiver_id and message_id
        
    Returns:
        Decrypted message and details
    """
    try:
        required_fields = ['receiver_id', 'message_id']
        for field in required_fields:
            if field not in request:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        receiver_id = request['receiver_id']
        message_id = request['message_id']
        
        result = messaging_service.receive_secure_message(
            receiver_id=receiver_id,
            message_id=message_id
        )
        
        if result.get('success', False):
            return result
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Message receiving failed'))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to receive message: {str(e)}")


@app.get("/messaging/messages/{user_id}")
async def get_user_messages(user_id: str, message_type: str = "all"):
    """
    Get messages for a specific user
    
    Args:
        user_id: User identifier
        message_type: Type of messages ('sent', 'received', 'all')
        
    Returns:
        List of user's messages
    """
    try:
        if message_type not in ['sent', 'received', 'all']:
            raise HTTPException(status_code=400, detail="Message type must be 'sent', 'received', or 'all'")
        
        messages = messaging_service.get_user_messages(user_id, message_type)
        return {
            "user_id": user_id,
            "message_type": message_type,
            "total_messages": len(messages),
            "messages": messages
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user messages: {str(e)}")


@app.get("/messaging/messages/{message_id}/details")
async def get_message_details(message_id: str, user_id: str):
    """
    Get detailed information about a specific message
    
    Args:
        message_id: Message identifier
        user_id: User requesting details
        
    Returns:
        Message details if authorized
    """
    try:
        details = messaging_service.get_message_details(message_id, user_id)
        
        if details:
            return details
        else:
            raise HTTPException(status_code=404, detail="Message not found or access denied")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get message details: {str(e)}")


@app.get("/messaging/statistics")
async def get_messaging_statistics():
    """Get statistics about the messaging service"""
    try:
        stats = messaging_service.get_messaging_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get messaging statistics: {str(e)}")


@app.delete("/messaging/clear-expired")
async def clear_expired_messages(max_age_hours: int = 24):
    """
    Clear expired messages
    
    Args:
        max_age_hours: Maximum age in hours for messages to keep
        
    Returns:
        Number of messages cleared
    """
    try:
        cleared_count = messaging_service.clear_expired_messages(max_age_hours)
        return {
            "message": f"Cleared {cleared_count} expired messages",
            "cleared_count": cleared_count,
            "max_age_hours": max_age_hours
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear expired messages: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
