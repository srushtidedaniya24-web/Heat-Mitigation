"""
THERMACITY — run_all.py
=======================
Orchestrates the full pipeline.

  python run_all.py              # train models + start API
  python run_all.py --skip-train # skip training, just start API
  python run_all.py --train-only # train only, don't start API

Pipeline:
  1. Generate synthetic tile dataset  (Model 2 data)
  2. Train XGBoost heat predictor     (Model 1)
  3. Train ThermaNet CNN classifier   (Model 2)
  4. Start FastAPI server on :8000
"""

import argparse
import subprocess
import sys
import json
from pathlib import Path

GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

def banner():
    print(f"""
{CYAN}{BOLD}
  ████████╗██╗  ██╗███████╗██████╗ ███╗   ███╗ █████╗  ██████╗██╗████████╗██╗   ██╗
     ██╔══╝██║  ██║██╔════╝██╔══██╗████╗ ████║██╔══██╗██╔════╝██║╚══██╔══╝╚██╗ ██╔╝
     ██║   ███████║█████╗  ██████╔╝██╔████╔██║███████║██║     ██║   ██║    ╚████╔╝
     ██║   ██╔══██║██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══██║██║     ██║   ██║     ╚██╔╝
     ██║   ██║  ██║███████╗██║  ██║██║ ╚═╝ ██║██║  ██║╚██████╗██║   ██║      ██║
     ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝   ╚═╝      ╚═╝
{RESET}
  {BOLD}Urban Heat Mitigation Intelligence Platform{RESET}
  Bhartiya Antariksh Hackathon 2026 — PS 1
    """)

def step(n, total, label):
    print(f"\n{CYAN}{BOLD}[{n}/{total}] {label}{RESET}")
    print("\u2500" * 50)

def ok(msg):   print(f"{GREEN}  \u2713 {msg}{RESET}")
def warn(msg): print(f"{YELLOW}  \u26A0 {msg}{RESET}")
def err(msg):  print(f"{RED}  \u2717 {msg}{RESET}")

def check_files():
    required = [
        "models/heat_predictor.json",
        "models/scaler.pkl",
        "models/feature_names.json",
        "models/thermanet.pth",
        "models/thermanet_config.json",
        "outputs/shap_summary.png",
        "outputs/training_curves.png",
        "outputs/confusion_matrix.png",
        "outputs/model_metrics.json",
    ]
    all_ok = True
    for f in required:
        if Path(f).exists():
            ok(f)
        else:
            warn(f"Missing: {f}")
            all_ok = False
    return all_ok

def main():
    banner()
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-train", action="store_true")
    parser.add_argument("--train-only", action="store_true")
    args = parser.parse_args()

    TOTAL = 4 if not args.skip_train else 1

    if not args.skip_train:
        step(1, TOTAL, "Generating thermal tile dataset (Model 2 data)")
        if Path("data/tiles/train/cool").exists():
            ok("Tile dataset already exists — skipping")
        else:
            import model2_step1_generate_tiles as tg
            tg.generate_dataset()

        step(2, TOTAL, "Training Model 1 — XGBoost Heat Predictor")
        if Path("models/heat_predictor.json").exists():
            ok("Model 1 already trained — skipping")
        else:
            import train_model as m1
            m1.main()

        step(3, TOTAL, "Training Model 2 — ThermaNet CNN Classifier")
        if Path("models/thermanet.pth").exists():
            ok("Model 2 already trained — skipping")
        else:
            subprocess.run([sys.executable, "model2_step2_train_cnn.py"], check=True)

        step(4 if not args.train_only else 3, TOTAL, "Checking outputs")
        all_good = check_files()

        try:
            with open("outputs/model_metrics.json") as f:
                metrics = json.load(f)
            print(f"\n  {BOLD}Model 1 Performance:{RESET}")
            print(f"    R\u00B2   (test) : {metrics['test']['r2']}")
            print(f"    RMSE (test) : {metrics['test']['rmse']}\u00B0C")
            print(f"    MAE  (test) : {metrics['test']['mae']}\u00B0C")
        except FileNotFoundError:
            pass

        try:
            with open("models/thermanet_config.json") as f:
                cfg = json.load(f)
            print(f"\n  {BOLD}Model 2 Performance:{RESET}")
            print(f"    Val accuracy : {cfg['best_val_acc']*100:.2f}%")
            print(f"    Parameters   : {cfg['parameters']:,}")
            print(f"    Best epoch   : {cfg['best_epoch']}")
        except FileNotFoundError:
            pass

        if args.train_only:
            print(f"\n{GREEN}{BOLD}Training complete.{RESET}")
            print(f"  Start API with: python api.py\n")
            return

    step(TOTAL, TOTAL, "Starting ThermaCity API")
    print(f"  {BOLD}Endpoints:{RESET}")
    print(f"    GET  http://localhost:8000/health")
    print(f"    GET  http://localhost:8000/heatmap")
    print(f"    GET  http://localhost:8000/hotspots")
    print(f"    POST http://localhost:8000/simulate")
    print(f"    GET  http://localhost:8000/recommend/downtown")
    print(f"    POST http://localhost:8000/classify")
    print(f"    GET  http://localhost:8000/classify/zone/downtown")
    print(f"    GET  http://localhost:8000/docs  \u2190 Swagger UI")
    print(f"\n  {YELLOW}Press Ctrl+C to stop{RESET}\n")

    try:
        import uvicorn
        uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=False)
    except ImportError:
        err("uvicorn not installed. Run: pip install fastapi uvicorn")
        sys.exit(1)

if __name__ == "__main__":
    main()
