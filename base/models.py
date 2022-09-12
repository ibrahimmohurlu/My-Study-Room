from pyexpat import model
from tabnanny import check
from django.db import models

# Create your models here.


class RoomMember(models.Model):
    name = models.CharField(max_length=200)
    uid = models.CharField(max_length=200)
    room_name = models.CharField(max_length=200)
    check_status = models.BooleanField(default=False)

    def __str__(self):
        return "{{name:{},uid:{},room_name:{},check_status:{}}}".format(self.name,self.uid,self.room_name,self.check_status)
