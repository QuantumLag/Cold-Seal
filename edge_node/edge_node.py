# edge_node.py - Runs on Raspberry Pi
from web3 import Web3
import json
import sqlite3
from datetime import datetime
import requests

class EdgeBlockchainNode:
    def __init__(self):
        self.local_db = sqlite3.connect('cold_chain_edge.db')
        self.pending_tx = []
        self.main_chain_available = False
        self.w3 = None
        
    def receive_sensor_reading(self, reading_data):
        """Receive from ESP32 via HTTP POST"""
        # Store locally first (immediate proof)
        self._store_locally(reading_data)
        
        # Try to sync to main blockchain
        self._sync_to_blockchain(reading_data)
    
    def _store_locally(self, reading_data):
        cursor = self.local_db.cursor()
        cursor.execute('''
            INSERT INTO readings (timestamp, temperature, humidity, esp32_id, synced)
            VALUES (?, ?, ?, ?, 0)
        ''', (
            datetime.now(),
            reading_data['temperature'],
            reading_data['humidity'],
            reading_data['esp32_id']
        ))
        self.local_db.commit()
        print(f"✓ Stored locally: {reading_data}")
    
    def _sync_to_blockchain(self, reading_data):
        try:
            if not self.w3:
                self.w3 = Web3(Web3.HTTPProvider('http://blockchain.example.com:8545'))
            
            if self.w3.is_connected():
                # Send to contract
                tx_hash = self.contract.functions.recordTemperature(
                    reading_data['temperature'],
                    reading_data['humidity']
                ).transact()
                
                print(f"✓ Synced to blockchain: {tx_hash.hex()}")
                self.main_chain_available = True
            else:
                print("⚠ Blockchain unavailable (will sync later)")
                self.main_chain_available = False
        except Exception as e:
            print(f"⚠ Sync failed: {e}")

# REST API endpoint for ESP32
from flask import Flask, request

app = Flask(__name__)
edge_node = EdgeBlockchainNode()

@app.route('/reading', methods=['POST'])
def receive_reading():
    data = request.json
    edge_node.receive_sensor_reading(data)
    return {'status': 'received'}, 202
