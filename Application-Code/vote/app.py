from flask import Flask, render_template, request, make_response, g
from redis import Redis
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import os
import socket
import random
import json
import logging


# ==========================
# Environment variables
# ==========================

option_a = os.getenv("OPTION_A", "Cats")
option_b = os.getenv("OPTION_B", "Dogs")

redis_host = os.getenv("REDIS_HOST", "redis")
redis_port = int(os.getenv("REDIS_PORT", "6379"))

hostname = socket.gethostname()


app = Flask(__name__)


# ==========================
# Prometheus Metrics
# ==========================

vote_requests_counter = Counter(
    "vote_requests_total",
    "Total number of votes received"
)

votes_counter = Counter(
    "votes_total",
    "Total votes by option",
    ["option"]
)

vote_errors_counter = Counter(
    "vote_errors_total",
    "Total number of vote processing errors"
)

vote_duration = Histogram(
    "vote_request_duration_seconds",
    "Time spent processing vote request"
)


# ==========================
# Logging
# ==========================

gunicorn_error_logger = logging.getLogger("gunicorn.error")

if gunicorn_error_logger.handlers:
    app.logger.handlers.extend(
        gunicorn_error_logger.handlers
    )

app.logger.setLevel(logging.INFO)


# ==========================
# Redis Connection
# ==========================

def get_redis():

    if not hasattr(g, "redis"):

        g.redis = Redis(
            host=redis_host,
            port=redis_port,
            db=0,
            socket_timeout=5
        )

    return g.redis



@app.teardown_appcontext
def close_redis(exception):

    redis = getattr(g, "redis", None)

    if redis:
        redis.close()



# ==========================
# Health Check
# ==========================

@app.route("/health")
def health():

    return {
        "status": "UP"
    }, 200



# ==========================
# Prometheus Metrics Endpoint
# ==========================

@app.route("/metrics")
def metrics():

    return generate_latest(), 200, {
        "Content-Type": CONTENT_TYPE_LATEST
    }



# ==========================
# Voting Endpoint
# ==========================

@app.route("/", methods=["GET", "POST"])
def hello():

    voter_id = request.cookies.get("voter_id")


    if not voter_id:

        voter_id = hex(
            random.getrandbits(64)
        )[2:-1]


    vote = None


    if request.method == "POST":

        with vote_duration.time():

            try:

                redis = get_redis()

                vote = request.form["vote"]

                vote_requests_counter.inc()


                if vote == "a":

                    vote_name = option_a

                else:

                    vote_name = option_b



                votes_counter.labels(
                    option=vote_name
                ).inc()



                app.logger.info(
                    "Received vote for %s",
                    vote_name
                )



                data = json.dumps(
                    {
                        "voter_id": voter_id,
                        "vote": vote
                    }
                )


                redis.rpush(
                    "votes",
                    data
                )



            except Exception as e:

                vote_errors_counter.inc()

                app.logger.error(
                    "Vote processing failed: %s",
                    e
                )



    response = make_response(
        render_template(
            "index.html",
            option_a=option_a,
            option_b=option_b,
            hostname=hostname,
            vote=vote
        )
    )


    response.set_cookie(
        "voter_id",
        voter_id
    )


    return response



# ==========================
# Application Startup
# ==========================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000
    )