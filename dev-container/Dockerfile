FROM docker:dind

RUN mkdir /nob

RUN apk update && apk add curl kubectl
RUN curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.14.0/kind-linux-amd64
RUN chmod +x ./kind
RUN mv ./kind /usr/local/bin/kind