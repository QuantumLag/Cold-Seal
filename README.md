# Vaccine Cold Chain Monitoring System

A comprehensive, multi-layer IoT system for real-time vaccine cold chain integrity monitoring with blockchain audit trails.

---

## 🌐 The Edge Layer (Runs on the ESP32 Hardware)

**`vaccine_edge_monitor.ino`**: The brain on the chip. It wakes up sensors, coordinates timing, handles local storage backups when offline, and packages data.

**`pins_and_objects.h`**: The hardware map. Tells the ESP32 exactly which physical pins the data wires (I2C/OneWire) are plugged into.

**`anomaly_detector.hpp`**: The live security guard. Uses pre-trained statistical boundaries to look at rolling sensor data windows and instantly spot sudden environmental spikes.

**`vaccine_quality_predictor.hpp`**: The digital pharmacist. Runs continuous kinetic equations ($Q_{10}$) on your thermal history to update the vaccine's health score (0–100) and shelf-life.

---

## 🖥️ The PC / Cloud Training Layer (Runs Once on Your Computer)

**`dataset_generator.py`**: The data factory. Generates fake cold-chain telemetry logs (normal vs. system failures) so you don't have to ruin real vaccines for training.

**`train_anomaly_model.py`**: The trainer. Analyzes the generated data to extract the mathematical constants (means/stdevs) that define what a "safe" environment looks like.

---

## ⛓️ The Infrastructure & Backend Layer (Runs on Local Server/Ganache)

**`deploy.py`**: The construction crew. Compiles your Solidity code, pushes it onto Ganache, and saves the connection coordinates to your config.

**`VaccineQuality.sol`**: The ledger. A smart contract that stores tamper-proof records of critical violations so logistics companies can't fake their safety history.

**`main.py`**: The central traffic cop. A FastAPI server that listens for incoming IoT data streams, decorates them with blockchain statuses, and flashes them out to your screen via WebSockets.

**`publisher.py`**: The digital double. A script that pretends to be your ESP32, pumping simulated data into your backend so you can test your code without touching hardware.

---

## 💻 The Frontend Layer (Runs in the Browser)

**`frontend/` folder (`index.html`)**: The control room. A clean, B2B light-mode dashboard that displays live tracking lines, flashing anomaly warning tickers, and master-detail logs of your blockchain audits.

---

## System Architecture Overview

This system integrates four independent layers working in concert:

- **Edge Computing** → Real-time sensor processing and anomaly detection on the device
- **ML Training** → Statistical model generation for anomaly boundaries
- **Blockchain Ledger** → Immutable audit trail of cold chain violations
- **Real-time Dashboard** → Live monitoring and historical blockchain records

Each layer operates independently but communicates through standardized APIs and configurations.
