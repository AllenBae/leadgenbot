echo "repo?"
read GITHUBREPO
echo "github commit msg?"
read GITHUBMSG

npm run build

rm -rf ./var/github
mkdir -p ./var/github/
git archive -o ./var/github/bot.zip HEAD

mkdir -p ./var/github/leadgenbot
git clone $GITHUBREPO ./var/github/leadgenbot
cd ./var/github/leadgenbot
unzip ../bot.zip
cp -rv ../../../bundle/* bundle/
rm -rf .gitignore
mv README.md README.md.tmp
node -e "var fs=require('fs');var dot=require('dot');console.log(dot.template(fs.readFileSync('./README.md.tmp'), Object.assign({}, dot.templateSettings, {strip: false}))({GITHUBREPO: '$GITHUBREPO'.replace('git@github.com:', 'https://github.com/')}));" >README.md
rm README.md.tmp
git add .
git commit -a -m "Update: ${GITHUBMSG}"
git push -f
cd -
