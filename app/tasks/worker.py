from arq import create_pool
from arq.connections import RedisSettings
from app.tasks.email import send_email


REDIS_HOST = "localhost"
REDIS_PORT = 6379


class WorkerSettings:
    """
    Configuration du worker ARQ.
    Lancement : arq app.tasks.worker.WorkerSettings
    """
    functions = [send_email]
    redis_settings = RedisSettings(host=REDIS_HOST, port=REDIS_PORT)
    keep_result = 3600  # conserve le résultat 1h
    poll_delay = 0.5    # vérifie toutes les 0.5s