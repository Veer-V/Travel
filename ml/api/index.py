import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from main import app
