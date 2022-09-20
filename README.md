# My-Study-Room

## Description
A group video calling application using the Agora Web SDK with a Django backend focused on creating time based (25min) working sessions, which means they are applying Pomodoro Technique. While session is active users microphone is muted therefore users can focus on things that they are working on. To start a session all the users in a room must give ready signal with <img src="./static/images/sand-clock-icon.png" alt="ready-button" width="20"/> button.

## How to run project

### 1 - Install requirements

```powershell
cd mystudyroom
pip install -r requirements.txt
```

### 2 - Update Agora Credentials

In order to run this project you will need to replace the agora credentials in `views.py` and `streams.js`. Create an account at [Agora.io](https://www.agora.io/en/) and create an app. Once you create your app, you will want to copy the appid & appCertificate to update `views.py` and `streams.js`.

`views.py`
```py
def getToken(request):
    appId = "YOUR APP ID"
    appCertificate = "YOUR APPS CERTIFICATE"
    ......
```

`streams.js`
```js
....
const APP_ID = 'YOUR APP ID'
....
```

### 3 - Run the server
```powershell
python manage.py runserver
```
