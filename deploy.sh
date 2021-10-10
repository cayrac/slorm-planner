 docker rm -f slormplanner
 docker build -t slormplanner-image .
 docker run -d -p 4200:8080  --name=slormplanner slormplanner-image