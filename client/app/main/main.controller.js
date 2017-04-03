'use strict';

angular.module('medicationReminderApp').controller('MainCtrl', function ($scope, $http, $window, $interval) {

    const start = moment().format('MM/DD/YYYY'),
          end = moment().add(1, 'day').format('MM/DD/YYYY');

    //Couldn't connect to MongoDB on my computer. This is fake data
    $scope.medArray =[
        {name: 'Medication 1', dosage:'10 ml', time: moment().add(1, 'm'), completed: false},
        {name: 'Medication 2', dosage:'20 ml', time: moment().add(5, 'm'), completed: false},
        {name: 'Medication 3', dosage:'30 ml', time: moment().add(5*2, 'm'), completed: false},
        {name: 'Medication 4', dosage:'40 ml', time: moment().add(5*3, 'm'), completed: false},
        {name: 'Medication 5', dosage:'40 ml', time: moment().add(1, 'd'), completed: false}
        ];

    //Sound notification => using Howler.js
    const sound = new Howl({
          src: ["./assets/sounds/Apashe & Sway - I'm A Dragon (Iron Fist Official Trailer Song).mp3"],
          loop: true
      });


    //Initialize data.
    $scope.meds = $scope.medArray.map((x) => ({
        name: x.name,
        dosage: x.dosage,
        time: moment(x.time).format('LLL'),
        completed: x.completed,
        remind: false,
        remindTwice: false,
        missed: false,
        shouldDisplay: false,
        playAudio: false
    })
  )

    $window.setInterval(function () {
        $scope.currentTime = moment().format('MMMM Do YYYY, h:mm:ss a');
        $scope.$apply();
        $scope.meds.forEach(displayTime);
        $scope.meds.forEach(notification);
        audioPlay($scope.meds);
    }, 1000);

    //Calendar options => can use to populate calendar with medication event data. Use for future development.
    $scope.eventSources = [];

    //Calandar options => config object.
    $scope.uiConfig = {
      calendar:{
        height: 450,
        header:{
          left: '',
          center: 'today prev,next',
          right: ''
        }
      }
    };

    //Only show medication to be taken today.
    function displayTime(x) {
      let timeDiff = moment(x.time).isSame(new Date(), "day");

      if(timeDiff) {
        x.shouldDisplay = true;
      }

      return x;
    }

    //To play audio or not that is the question.
    function audioCondition(x) {
      let condition =  x.map((y) => {
                          if(y.playAudio && (!y.completed)) {
                            return true;
                          }
                          else {
                            return false;
                          }
                        }).reduce(function (prev, now) {
                            return prev || now;
                        }, false);

        return condition;

    }

    //To play loud or not that is the question.
    function loudAudioCondition(x) {
      let condition = x.map((y) => {
                        if(y.remindTwice && (!y.completed)) {
                          return true;
                        }
                        else {
                          return false;
                        }
                      }).reduce(function (prev, now) {
                          return prev || now;
                        }, false);

      return condition;
    }

    //Play audio if conditions allow.
    function audioPlay(x) {
      let play = audioCondition(x);
      let playLoud = loudAudioCondition(x);
      if (play) {
        playAudio(sound, playLoud);
      }
      else {
        sound.stop();
      }


    }

    //Function to make sure sound.play() doesn't get called every second and controls the volume of audio without affecting playback.
    function playAudio(sound, playLoud) {
        if (!sound.playing()) {
            sound.play();
        }
        if(playLoud) {
          sound.volume(1);
        }
        if(!playLoud) {
          sound.volume(0.1);
        }
    }


    function notification(x) {

        let timeDiff = moment(x.time).diff(moment(), 'minutes');

        if (timeDiff <= 5) {
          //5 min before medication time => Put under Reminder and create checkbox.
            x.remind = true;
        }
        if (timeDiff <= 0) {
          //Medication time => Time for audio
            x.playAudio = true;
        }
        if (timeDiff <= -5) {
          //5 min after medication time => Time to turn up the music amd put in Missed and remove from Reminder.
            x.remind = false;
            x.remindTwice = true;
            x.missed = true;
        }
        if (timeDiff <= -6) {
          //1 min later => Turn off music.
            x.remindTwice = false;
            x.playAudio = false;
        }
        return x;
    }



})
