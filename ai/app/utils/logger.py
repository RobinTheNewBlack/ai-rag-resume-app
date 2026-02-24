import logging
import sys
from app.config.config import settings

def setup_logger():
    """
    Configure the root logger based on the LOG_LEVEL environment variable.
    Levels: none, error, warn, info, debug
    """
    log_level_str = settings.LOG_LEVEL.lower()
    
    # Map string levels to logging constants
    # "none" is handled by setting level to CRITICAL + 1
    level_map = {
        "none": logging.CRITICAL + 1,
        "error": logging.ERROR,
        "warn": logging.WARNING,
        "warning": logging.WARNING,
        "info": logging.INFO,
        "debug": logging.DEBUG
    }
    
    log_level = level_map.get(log_level_str, logging.INFO)
    
    # Configure logging
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True # Force reconfiguration if already configured
    )
    
    # Set level for this app's logger specifically if needed, 
    # but basicConfig sets the root logger which is usually sufficient.
    # We can also silence noisy libraries if needed in the future.
    if log_level_str == "none":
        logging.disable(logging.CRITICAL + 1)
    else:
        logging.disable(logging.NOTSET)

setup_logger()
