from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import cache_control

from user.models import User
from annotation.models import Guess1,Guess2,Guess3, QuestionSet

import datetime
import sys



@csrf_exempt
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def screen(request):
	
	user_id = request.session['user']
	user = User.objects.get(pk=user_id)
	
	current_round = user.current_round
	if current_round == 1:
		return render(request, 'intro1.html')

	if current_round == 2:
		return render(request, 'intro2.html')

	if current_round == 3:
		return render(request, 'intro3.html')

	if current_round == 4:
		return render(request,'end.html')

@csrf_exempt
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def end(request):
		return render(request, 'end.html')


@csrf_exempt
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def intro1(request):
		return render(request, 'intro1.html')

@csrf_exempt
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def round1(request):
		return render(request, 'round1.html')



@csrf_exempt
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def intro2(request):
		return render(request, 'intro2.html')

@csrf_exempt
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def round2(request):
		return render(request, 'round2.html')

@csrf_exempt
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def intro3(request):
		return render(request, 'intro3.html')

@csrf_exempt
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def round3(request):
		return render(request, 'round3.html')


def get_details(request):
	user_id = request.session['user']
	user = User.objects.get(pk=user_id)
	
	current_round = user.current_round
	question_set_id = user.question_set
	question_set = QuestionSet.objects.get(pk=question_set_id)

	if current_round == 1: 
		guess_class = Guess1
		all_files = question_set.round1_files.all()
	elif current_round == 2:
		guess_class = Guess2
		all_files = question_set.round2_files.all()
	
	elif current_round == 3:
		guess_class = Guess3
		all_files = question_set.round3_files.all()
		print(all_files)

	return user, guess_class, all_files,current_round

@csrf_exempt
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def render_next_video3(request):

	user, guess_class, all_files,current_round = get_details(request)
	# print(current_round)
	pending = guess_class.objects.filter(pending=True, user=user)
	guess = pending.first()
	print("GUESS iS ", guess)
	done = guess_class.objects.filter(pending=False, user=user).values('files')
	question = done.count() // 2 + 1
	if guess is not None :
		model_action_files = guess.files.all()
		print("model files in guess is", model_action_files)
		return JsonResponse({
			'mugl_path' : model_action_files[0].path,
			'truth_path' : model_action_files[1].path,
			'action' :  model_action_files[0].action,
			'question' : question

		})

	remaining = all_files.exclude(pk__in=done)

	if remaining.all().first() is None: 
		user.current_round += 1
		user.save()
		return HttpResponse('/annotation/end', status=404)

	next_videos = remaining.all()[:2]

	g = guess_class.objects.create(user=user)
	g.files.add(next_videos[0])
	g.files.add(next_videos[1])
	g.save()
	print("NEW FILES IN GUESS",g.files.all())

	return JsonResponse({
				'action' : next_videos[0].action,
				'mugl_path' : next_videos[0].path,
				'truth_path' : next_videos[1].path,
				'question' : question
			
			})





@csrf_exempt
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def render_next_video(request):
	user, guess_class, all_files,current_round = get_details(request)

	pending = guess_class.objects.filter(pending=True, user=user)
	
	guess = pending.first()
	done = guess_class.objects.filter(pending=False, user=user).values('file')

	question = done.count() + 1
	print("QUESTION ", question + 1)

	if guess is not None:
		# print("RETURNING SAME FILE AGAIN",guess.file.action)
		return JsonResponse({
					'action' : guess.file.action,
					'path' : guess.file.path,
					'question' : question,
					'option1' : guess.file.option1,
					'option2' : guess.file.option2,
					'option3' : guess.file.option3,
					'option4' : guess.file.option4,

				})

	remaining = all_files.exclude(pk__in=done)
	video = remaining.first()

	if video is None:
		if current_round == 1 : 
			print("ROUND 1 done")
			user.current_round = 2
			user.save() 
			return HttpResponse('/annotation/intro2', status=404)
		if current_round == 2 : 
			user.current_round = 3
			user.save() 
			return HttpResponse('/annotation/intro3', status=404)

	g = guess_class.objects.create(file=video,user=user)
	# print("creating New guess object ---", g)

	return JsonResponse({
				'action' : video.action,
				'path' : video.path,
				'question' : question,
				'option1' : video.option1,
				'option2' : video.option2,
				'option3' : video.option3,
				'option4' : video.option4,
			})



@csrf_exempt
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def submitAnnotation_Round1(request):
	print("SUBMIT ANNOTATION CALLED")
	print(request)
	user_id = request.session['user']
	user = User.objects.get(pk=user_id)
	current_round = user.current_round

	if current_round == 3:
		guess_object = Guess3.objects.filter(pending=True, user=user).first()
		guess_object.rank = request.POST.get('rank')
		guess_object.pending = False
		guess_object.save()
		return JsonResponse({'sent':True})

	guess = request.POST.get('guess')
	num_pause = request.POST.get('num_pause')
	num_replay = request.POST.get('num_replay')
	
	if current_round == 1:
		guess_object = Guess1.objects.filter(pending=True, user=user).first()
	elif current_round == 2:
		guess_object = Guess2.objects.filter(pending=True, user=user).first()
	# print("MY GUESS OBJECT WAS--- " ,guess_object)
	guess_object.guess = guess
	guess_object.num_pause = num_pause
	guess_object.num_replay = num_replay
	guess_object.pending = False
	guess_object.save()


	if current_round == 1 and guess == guess_object.file.action:
		user.score += 1
		user.save()
	if current_round == 1:
		return JsonResponse({'correctAnswer':guess_object.file.action, 'status':guess == guess_object.file.action})
	elif current_round == 2:
		return JsonResponse({'correctAnswer':guess_object.file.action})