import redis
from abc import ABC, abstractmethod
from typing import Optional


class RedisConnector(ABC):
    _last_connection: Optional["RedisConnector"] = None

    def __init__(self):
        self.client: Optional[redis.Redis] = None

    @staticmethod
    def create(params: dict) -> "RedisConnector":
        mode = params.get("mode")
        if mode == "default":
            connector = ConnectDefault()
        elif mode == "connectString":
            connect_string = params.get("connectString")
            if not connect_string:
                raise ValueError("connectString required for connectString mode")
            connector = ConnectWithConnectString(connect_string)
        elif mode == "hostPort":
            host = params.get("host")
            port = params.get("port")
            if not host or not port:
                raise ValueError("host and port required for hostPort mode")
            connector = ConnectWithUserPass(
                host,
                port,
                params.get("user"),
                params.get("password"),
            )
        else:
            raise ValueError("Invalid connection mode")

        connector.connect()
        RedisConnector._last_connection = connector
        return connector

    def get_client(self) -> Optional[redis.Redis]:
        return self.client

    @staticmethod
    def last_connection() -> Optional["RedisConnector"]:
        return RedisConnector._last_connection

    @staticmethod
    def has_last_connection() -> bool:
        return RedisConnector._last_connection is not None

    @abstractmethod
    def connect(self):
        pass

    def ping(self) -> bool:
        try:
            if not self.client:
                return False
            response = self.client.ping()
            print("PONG" if response else "NO RESPONSE")
            return response
        except Exception as e:
            print("Redis ping error:", e)
            return False

    def quit(self):
        if self.client:
            self.client.close()


class ConnectDefault(RedisConnector):
    def connect(self):
        self.client = redis.Redis(decode_responses=True)  # defaults to localhost:6379
        # Test connection
        self.client.ping()


class ConnectWithConnectString(RedisConnector):
    def __init__(self, connection_string: str):
        super().__init__()
        self.connection_string = connection_string

    def connect(self):
        self.client = redis.from_url(self.connection_string, decode_responses=True)
        self.client.ping()


class ConnectWithUserPass(RedisConnector):
    def __init__(self, host: str, port: int, user: Optional[str] = None, password: Optional[str] = None):
        super().__init__()
        self.host = host
        self.port = port
        self.user = user
        self.password = password

    def connect(self):
        url = "redis://"
        if self.user and self.password:
            url += f"{self.user}:{self.password}@"
        url += f"{self.host}:{self.port}"
        self.client = redis.from_url(url, decode_responses=True)
        self.client.ping()
