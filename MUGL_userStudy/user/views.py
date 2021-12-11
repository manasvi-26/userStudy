
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import cache_control

from user.models import User
import datetime
import sys

# Create your views here.

@csrf_exempt
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def dashboard(request):
		if 'user' in request.session:
			print("USER IS ," , request.session['user'])
			return HttpResponseRedirect('/annotation/')
		
		else:
			return render(request, 'dashboard.html')

@csrf_exempt
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def addNewUser(request):
	name = request.POST.get('name','')
	age = request.POST.get('age','')
	aff = request.POST.get('affiliation','')
	gender = request.POST.get('gender','')
	question_set = (User.objects.count() // 5) + 1

	user = User.objects.create(name=name, age=age, aff=aff, gender=gender,question_set=question_set,current_round=1)
	# console.log('should get called')
	user.save()

	user_id = User.objects.count()
	request.session['user'] = user_id
	# print("NEW USER IS ---", user_id)
	return HttpResponse('/annotation/')