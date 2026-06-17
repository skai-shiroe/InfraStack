from arq import create_pool
from arq.connections import RedisSettings
from typing import Optional
from arq.connections import ArqRedis

REDIS_SETTINGS = RedisSettings(host="localhost", port=6379)

_pool: Optional[ArqRedis] = None


async def get_arq_pool():
    """Retourne le pool ARQ (créé une seule fois)."""
    global _pool
    if _pool is None:
        _pool = await create_pool(REDIS_SETTINGS)
    return _pool


async def close_arq_pool():
    """Ferme le pool ARQ."""
    global _pool
    if _pool:
        _pool.close()
        await _pool.wait_closed()
        _pool = None