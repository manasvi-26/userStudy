import csv
import sys
import os
import random
from random import  shuffle, randint
from shutil import copyfile
import re
from annotation.models import ActionFiles, QuestionSet
from tqdm import tqdm

person1 = set()
person2 = set()
all_actions = set()

def fill_actionSet():

    global person1
    global all_actions

    f = open('person1_actionNames.txt','r')
    lines = f.readlines()
    for line in lines:
        line = re.sub('\s+','',line)
        person1.add(line)
        all_actions.add(line)
        
    global person2
    f = open('person2_actionNames.txt', 'r')
    lines = f.readlines()
    for line in lines:
        line = re.sub('\s+','',line)
        person2.add(line)


def sampling_dict():

    actions = dict()
    
    for action in person1:
        actions[action] = []
        for i in range(5):
            actions[action].append(i)
        shuffle(actions[action])


    for action in person2:
        actions[action] = []
        for i in range(5):
            actions[action].append(i)        
        shuffle(actions[action])

    return actions


def pick_action(single_person_only=False):
    global person1
    global person2

    choice = randint(0,100)
    person = -1
    if single_person_only == True: choice = 0
    if choice < 70:
        action = random.sample(person1, k=1)[0]
        person1.remove(action)
        person = 1
    else:
        action = random.sample(person2, k=1)[0]
        person2.remove(action)
        person = 2

    return person, action
    

def fill_database(filename):
    
    fill_actionSet()

    mugl_actions = sampling_dict()
    truth_actions = sampling_dict()
    actor_actions = sampling_dict()
    mugl_old_actions = sampling_dict()


    total_sets = 10

    for i in range(total_sets):
        print("set ---> ", i)
        fill_actionSet()
        q = QuestionSet()
        q.save()

        #round 1:
        #pick action
        
        for i in range(5): #%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% change thisss to 5
            
            person, action = pick_action(single_person_only=True)
            sample = mugl_actions[action].pop()
            rotationPath = os.path.join(filename, "MUGL","person_"+str(person) ,action,"rotation", "sample"+str(sample) + ".json" )
            translationPath = os.path.join(filename, "MUGL","person_"+str(person) ,action,"translation", "sample"+str(sample) + ".json" )


            #picking options:
            options = random.sample(all_actions, k=3)
            options.append(action)
            shuffle(options)

            a = ActionFiles.objects.create(action = action, rotationPath = rotationPath,translationPath = translationPath, person=person
                                            , option1=options[0]
                                            , option2=options[1]
                                            , option3=options[2]
                                            , option4=options[3]
                
                )
            q.round1_files.add(a)


        #round 2:
        #pick action

        action_paths = []
        for i in range(3): #%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% change thisss to 3

            person, action = pick_action(single_person_only=True)
            sample = mugl_actions[action].pop()
            rotationPath = os.path.join(filename, "MUGL","person_"+str(person) ,action,"rotation", "sample"+str(sample) + ".json" )
            translationPath = os.path.join(filename, "MUGL","person_"+str(person) ,action,"translation", "sample"+str(sample) + ".json" )
            action_paths.append((rotationPath,translationPath, action, person))


        for i in range(3): #%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% change thisss to 1
            
            person, action = pick_action(single_person_only=True)
            sample = mugl_actions[action].pop()
            rotationPath = os.path.join(filename, "MUGL","person_"+str(person) ,action,"rotation", "sample"+str(sample) + ".json" )
            translationPath = os.path.join(filename, "MUGL","person_"+str(person) ,action,"translation", "sample"+str(sample) + ".json" )
            action_paths.append((rotationPath,translationPath, action, person))

        shuffle(action_paths)
        
        ##*** Over here add to question set ***
        for item in action_paths:
            rotationPath,translationPath, action, person = item[0], item[1], item[2], item[3]

            a = ActionFiles.objects.create(action = action, rotationPath = rotationPath,translationPath = translationPath, person=person)
            q.round2_files.add(a)

        
        #round 3
        #pick action
        for i in range(5):
            person, action = pick_action(single_person_only=True)
            sample1 = mugl_actions[action].pop()
            sample2 = truth_actions[action].pop()
            sample3 = mugl_old_actions[action].pop()
            sample4 = actor_actions[action].pop()

            mugl_path = os.path.join(filename, "MUGL","person_"+str(person) ,action,"rotation", "sample"+str(sample1) + ".json" )
            truth_path = os.path.join(filename, "GROUND_TRUTH","person_"+str(person) ,action,"rotation", "sample"+str(sample2) + ".json" )
            mugl_old_path = os.path.join(filename, "MUGL_OLD","person_"+str(person) ,action,"rotation", "sample"+str(sample3) + ".json" )
            actor_path = os.path.join(filename, "ACTOR","person_"+str(person) ,action,"rotation", "sample"+str(sample4) + ".json" )

            a1 = ActionFiles.objects.create(action = action, rotationPath = mugl_path, modelName= "MUGL")
            a2 = ActionFiles.objects.create(action = action, rotationPath = truth_path, modelName= "TRUTH")
            a3 = ActionFiles.objects.create(action = action, rotationPath = mugl_old_path, modelName= "MUGL_OLD")
            a4 = ActionFiles.objects.create(action = action, rotationPath = actor_path, modelName= "ACTOR")
            

            q.round3_files.add(a1)
            q.round3_files.add(a2)
            q.round3_files.add(a3)
            q.round3_files.add(a4)




fill_database('media/action_files')
    

