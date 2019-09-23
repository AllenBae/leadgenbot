echo "app?"
read APP

echo "repo?"
read GITHUBREPO

CWD="$(pwd)"

rm -rf ./var/heroku
mkdir -p ./var/heroku

git clone $GITHUBREPO ./var/heroku/githubrepo

cd ./var/heroku
heroku git:clone -a $APP
cp -rv ./githubrepo/* ./$APP/

cd ./$APP
git add .
git commit -a -m "Updates $(date)"
git push -f heroku master
cd -

cd $CWD
