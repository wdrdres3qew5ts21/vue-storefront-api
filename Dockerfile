FROM yarnpkg/node-yarn
ADD . .
RUN yarn
EXPOSE 8080
CMD [ "yarn","dev" ]