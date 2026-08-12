Project Description

The domain of our project is in Sports, Fan Engagement and Community Building. Implementing a Formula 1 prediction platform providing Users with the chance to predict outcomes of race weekends throughout the formula 1 season, earning  points based on accuracy. Additionally, the application will allow multiple users to compete together by comparing their scores.

**Tech Stack**

- Node.js backend with Express.js for API routing and endpoints
- Uses session authentication and server-side rendering that are self built

Note: The project imports the node-cron and cryptography packages, which the cs servers do not support and it is impossible to import them while on the servers. The project will still function on the CS servers, but you must comment out the validation.js file and it's dependants. The best method is to move the project off the CS server while still maintaining the same oracle connection with the instructions below.

**How to Move Project From CS Servers to Local Machine**
- Since the CS servers do not allow downloading additional packages or dependancies, specific parts of this project cannot function on the servers anymore (as of 08/09/26).
You must download the specific oracle client software from https://www.oracle.com/database/technologies/instant-client onto your machine. After this, you can locally download the project and make a couple changes
- You must copy your .env file from the project on the server to your machine since it is included in the .gitignore
- For MacOS silicon, you also need to edit the oracledb version in your package.json to "oracledb": "^6.9.0" becuase binaries do not exist for these older versions
- run npm install to reinstall the express and oracledb packages for your project
- Change your remotestart.sh file to the following depending on your oprating system

For MacOS:

```#!/bin/bash

# Set Oracle environment
if [ -d "$HOME/[PATH TO YOUR ORACLE CLIENT SOFTWARE] ]; then
    export ORACLE_HOME="$HOME/[PATH TO YOUR ORACLE CLIENT SOFTWARE]
    export DYLD_LIBRARY_PATH=$ORACLE_HOME
elif [ -d /usr/lib/oracle/19.6/client64/lib ]; then
    export ORACLE_HOME=/usr/lib/oracle/19.6/client64
    # 19.* libraries will be already configured by ldconfig
    #export LD_LIBRARY_PATH=$ORACLE_HOME/lib
elif [ -d /usr/lib/oracle/12.2/client64/lib ]; then
    export ORACLE_HOME=/usr/lib/oracle/12.2/client64
    export LD_LIBRARY_PATH=$ORACLE_HOME/lib
else
    echo "Oracle not found..."
    exit 1
fi


# Configure the shared Node library on the undergrad server.
export NODE_PATH=/cs/local/generic/lib/cs304/node_modules

# File path
ENV_SERVER_PATH="./.env"

# Check the database host name and port
sed -i '' '/^ORACLE_HOST=/c\
ORACLE_HOST=dbhost.students.cs.ubc.ca
' "$ENV_SERVER_PATH"
sed -i '' '/^ORACLE_PORT=/c\
ORACLE_PORT=1522
' "$ENV_SERVER_PATH"

# Define starting port
START=49152
TEAM_NUMBER=4141 # PUT YOUR TEAM NUMBER HERE!!!
MAX_PORT=65535

# Check if TEAM_NUMBER is set
if [ -z "$TEAM_NUMBER" ]; then
    echo "TEAM_NUMBER needs to be set in remote-start.sh script"
    exit 1
fi

# Loop through ports, incrementing by 200 until an available port is found
PORT=$((START + TEAM_NUMBER))
while [ $PORT -le $MAX_PORT ]; do
    # Check if the port is in use
    if ! ss -tuln | grep :$PORT > /dev/null; then
        # Bind to the port using a temporary process
        nc -l -p $PORT &
        TEMP_PID=$!

        # Update the port number in the .env file
        sed -i '' "/^PORT=/c\\
        PORT=$PORT
        " "$ENV_SERVER_PATH"
        echo "Updated $ENV_SERVER_PATH with PORT=$PORT."

        # Kill the temporary process
        kill $TEMP_PID

        # Replace the bash process with the Node process
        exec node server.js
        break
    fi
    
    # Increment port by 200 and try again
    PORT=$((PORT + 200))
done

# If no available port was found
if [ $PORT -gt $MAX_PORT ]; then
    echo "No available port found between $START and $MAX_PORT"
    exit 1
fi
```



