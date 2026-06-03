FROM node:18-slim

# Install Python 3, pip, and build tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python libraries (handling system package boundaries on Debian)
RUN pip3 install --no-cache-dir --break-system-packages numpy pandas scikit-learn joblib || \
    pip3 install --no-cache-dir numpy pandas scikit-learn joblib

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
