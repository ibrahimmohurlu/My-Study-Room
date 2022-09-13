from django.shortcuts import render
from django.http import JsonResponse
from django.core import serializers
from agora_token_builder import RtcTokenBuilder
from .models import RoomMember
from django.views.decorators.csrf import csrf_exempt
import random
import time
import json

# Create your views here.


@csrf_exempt
def createMember(request):
    data = json.loads(request.body)
    member, created = RoomMember.objects.get_or_create(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name']
    )
    return JsonResponse({'name': data['name']}, safe=False)


@csrf_exempt
def deleteMember(request):
    data = json.loads(request.body)
    member = RoomMember.objects.get(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name']
    )
    member.delete()
    return JsonResponse('Member deleted.', safe=False)


def getMember(request):
    uid = request.GET.get('UID')
    room_name = request.GET.get('room_name')

    member = RoomMember.objects.get(
        uid=uid,
        room_name=room_name
    )
    name = member.name
    uid = member.uid
    room_name = member.room_name
    check_status = member.check_status
    return JsonResponse({'name': name, 'uid': uid, 'room_name': room_name, 'check_status': check_status}, safe=False)


def getMembers(request):
    room_name = request.GET.get('room_name')

    members = RoomMember.objects.filter(room_name=room_name)
    members_json = list(members.values())
    return JsonResponse({'members': members_json}, safe=False)


def updateMemberStatus(request):
    uid = request.GET.get('UID')
    room_name = request.GET.get('room_name')
    member = RoomMember.objects.get(
        uid=uid,
        room_name=room_name
    )
    if member.check_status == True:
        member.check_status = False
    else:
        member.check_status = True

    member.save()
    return JsonResponse({'name': member.name, 'uid': member.uid, 'room_name': member.room_name, 'check_status': member.check_status}, safe=False)


def canSessionStart(request):
    room_name = request.GET.get('room_name')
    members = RoomMember.objects.filter(room_name=room_name)
    can_session_start=False
    states=[]
    for member in members:
        states.append(member.check_status)
    if states.__contains__(False):
        can_session_start=False
    else:
        can_session_start=True
    return JsonResponse({'can_session_start': can_session_start}, safe=False)
        


def getToken(request):
    appId = 'eb3e875e3cec4057b70bd1e07645b3c0'
    appCertificate = 'e1d55731d289498f9864faab95d82387'
    channelName = request.GET.get('channel')
    uid = random.randint(1, 230)
    expirationTimeInSeconds = 3600*24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = 1
    token = RtcTokenBuilder.buildTokenWithUid(
        appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token': token, 'uid': uid}, safe=False)


def lobby(request):
    return render(request, 'base/lobby.html')


def room(request):
    return render(request, 'base/room.html')
