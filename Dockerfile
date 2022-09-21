FROM node:16-alpine

COPY .	/app
WORKDIR /app/services

# Get dependencies
RUN yarn

# Run the batch job
ENTRYPOINT ["yarn", "start"]

# While passing parameters in
CMD ["--params", "params-passed-in-via-dockerfile"]

