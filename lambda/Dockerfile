# Use the official Python image from Docker Hub
FROM public.ecr.aws/lambda/python:3.13

# Set the working directory inside the container
WORKDIR /var/task

# Copy the Lambda function code and dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the Lambda function code
COPY thinq_handler.py .

# Set the command to run the Lambda function
CMD ["thinq_handler.handler"]
