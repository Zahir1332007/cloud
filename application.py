import os
import sys

# Ensure 'backend' directory is on Python path so 'app' can be imported anywhere
root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Elastic Beanstalk expects a callable named 'application' by default
from app.main import app as application

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("application:application", host="0.0.0.0", port=port, reload=False)

