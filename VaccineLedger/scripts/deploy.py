#It takes your blueprint (the Solidity code), turns it into physical "building blocks" (bytecode),
#and puts it on the site (Ganache).
import os
import json
from web3 import Web3
from solcx import install_solc, set_solc_version, compile_standard
from dotenv import load_dotenv

load_dotenv()

# 1. Force install a stable version that Ganache likes
print("Installing solc v0.8.20...")
install_solc('0.8.20')
set_solc_version('0.8.20')

#creates the phone line to the blockchain
w3 = Web3(Web3.HTTPProvider(os.getenv("GANACHE_URL")))
#this identifies who is paying for the deployment (which account address)
account = w3.eth.account.from_key(os.getenv("PRIVATE_KEY"))

# Construct the absolute path to the contract file
contract_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "contracts", "VaccineQuality.sol"))
with open(contract_path, "r") as f:
    contract_source = f.read()

# 2. Compile with 'paris' EVM to avoid the PUSH0 (invalid opcode) error
# this function translates the human readable solidity code into the binary code that the block
# chain understands
compiled_sol = compile_standard({
    "language": "Solidity",
    "sources": {"VaccineQuality.sol": {"content": contract_source}},
    "settings": {
        "optimizer": {"enabled": True, "runs": 200},
        "evmVersion": "paris",  # This fixes the 'invalid opcode'
        "outputSelection": {"*": {"*": ["abi", "evm.bytecode.object"]}}
    }
}, solc_version='0.8.20')

# Change "VaccineQuality" to whatever is written after 'contract' in your .sol file
# This extracts the actual "binary" that will live on the blockchain.
bytecode = compiled_sol["contracts"]["VaccineQuality.sol"]["VaccineLedger"]["evm"]["bytecode"]["object"]
abi = compiled_sol["contracts"]["VaccineQuality.sol"]["VaccineLedger"]["abi"]

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)  # Steps up to VaccineLedger/
TARGET_BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

# Ensure it writes directly to the actual root backend/ folder
os.makedirs(TARGET_BACKEND_DIR, exist_ok=True)
with open(os.path.join(TARGET_BACKEND_DIR, "abi.json"), "w") as f:
    json.dump(abi, f)
print("🎯 ABI successfully written to root backend/abi.json")

# 3. Deploy
print("Deploying contract...")
# This prepares a Python object representing your contract.
Vaccine = w3.eth.contract(abi=abi, bytecode=bytecode)
# This calculates the Gas Price, the Chain ID (your network's ID), and the Nonce 
# (the transaction number for your account). It's basically preparing the "check" you're about to sign.
tx = Vaccine.constructor().build_transaction({
    "chainId": 1337, 
    "gasPrice": w3.eth.gas_price, 
    "from": account.address, 
    "nonce": w3.eth.get_transaction_count(account.address)
})

#The Signature: This uses your Private Key to authorize the transaction. This is the "No-Tamper" 
# part—only someone with your key can deploy this specific contract from your account.
signed_tx = w3.eth.account.sign_transaction(tx, private_key=os.getenv("PRIVATE_KEY"))

# The Launch: This finally blasts the signed data to Ganache.
tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction) 

# The Receipt: Python waits until the block is "mined." Once done, it gives you the Contract Address
# (where your contract now lives permanently).
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

print(f"🚀 Success! Contract Address: {tx_receipt.contractAddress}")
# ... (at the very bottom, after your print statement)

# 4. Automatically update the .env file
# Force Python to find the .env file in the root directory, no matter where the terminal is run from

env_path = os.path.join(ROOT_DIR, ".env")
new_address_line = f"CONTRACT_ADDRESS={tx_receipt.contractAddress}\n"

if os.path.exists(env_path):
    with open(env_path, "r") as f:
        lines = f.readlines()
    
    with open(env_path, "w") as f:
        found = False
        for line in lines:
            if line.startswith("CONTRACT_ADDRESS="):
                f.write(new_address_line)
                found = True
            else:
                f.write(line)
        if not found:
            f.write(new_address_line)
    print("✅ .env file successfully updated with new address!")
else:
    # If .env doesn't exist yet, create it fresh in the root directory
    with open(env_path, "w") as f:
        f.write(new_address_line)
    print("📝 Created fresh .env file in root with contract address!")