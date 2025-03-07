# Garmin Climb Charts 🧗‍♂️⌚️📈

Garmin connect doesn't have the charts I want so I decided to make my own CLI to display the charts I want to see for rock climbing.

# Usage

```shell
npm i -g garminclimb
garminclimb login -u username -p password
garminclimb download # download your data
garminclimb charts
```

You can see your raw data at `~/.gc_data`

```shell
cd ~/.gc_data
ls
```

# Develop locally or make your own charts

```shell
npm i 
npm link
npm run watch
# change parse.ts in /src to edit charts
# then all commaands will be locally linked to your code
garminclimb login -u username -p password
garminclimb download # download your data
garminclimb charts
```
