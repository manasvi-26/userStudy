from django.db import models
# Create your models here.

class User(models.Model):
	
	name = models.CharField(max_length=200)
	age = models.CharField(max_length=10)
	aff = models.CharField(max_length=200)
	gender = models.CharField(max_length=200)
	score = models.IntegerField(default=0, unique=False)
	current_round = models.IntegerField(default=1)
	question_set = models.IntegerField(default=1)
