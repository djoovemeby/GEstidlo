#!/bin/bash

# Function to kill all background jobs on exit
cleanup() {
    echo "Stopping all services..."
    kill $(jobs -p)
}
trap cleanup EXIT

echo "Starting GEstidlo Environment..."

# 1. Build Backend (Skip tests for speed)
echo "Building Backend..."
mvn clean install -DskipTests -f backend/camunda-engine/pom.xml &
mvn clean install -DskipTests -f backend/camunda-api/pom.xml &
mvn clean install -DskipTests -f backend/api-metier/pom.xml &
mvn clean install -DskipTests -f frontend/bff/pom.xml &
wait

echo "Backend Build Complete. Starting Services..."

# 2. Start Backend Services
java -jar backend/camunda-engine/target/camunda-engine-0.0.1-SNAPSHOT.jar &
PID_ENGINE=$!
echo "Camunda Engine started (PID: $PID_ENGINE) on port 9080"

java -jar backend/camunda-api/target/camunda-api-0.0.1-SNAPSHOT.jar &
PID_API=$!
echo "Camunda API started (PID: $PID_API) on port 9081"

java -jar backend/api-metier/target/api-metier-0.0.1-SNAPSHOT.jar &
PID_METIER=$!
echo "API Metier started (PID: $PID_METIER) on port 9082"

java -jar frontend/bff/target/bff-0.0.1-SNAPSHOT.jar &
PID_BFF=$!
echo "BFF started (PID: $PID_BFF) on port 9083"

# 3. Start Frontend
echo "Starting Angular Frontend..."
cd frontend/spa
ng serve &
PID_SPA=$!
echo "Angular SPA started (PID: $PID_SPA) on port 4200"

# Wait for user input to exit
echo "All services are running. Press [ENTER] to stop."
read
