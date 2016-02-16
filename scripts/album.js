var createSongRow = function (songNumber, songName, songLength) {

   var template =
      '<tr class="album-view-song-item">' +
      '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>' +
      '  <td class="song-item-title">' + songName + '</td>' +
      '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>' +
      '</tr>';

  var $row = $(template);

  var clickHandler = function() {

        var songNumber = parseInt($(this).attr('data-song-number'));

        if (currentlyPlayingSongNumber !== null) {
            // Revert to song number for currently playing song because user started playing new song.
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            
            currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }
        
         if (currentlyPlayingSongNumber !== songNumber) {
             // Switch from Play -> Pause button to indicate new song is playing.
             setSong(songNumber);
             currentSoundFile.play();
             $(this).html(pauseButtonTemplate);
             currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
             updatePlayerBarSong();
         } else if (currentlyPlayingSongNumber === songNumber) {
               if (currentSoundFile.isPaused()) {
                 $(this).html(pauseButtonTemplate);
                 $('.main-controls .play-pause').html(playerBarPauseButton);
                 currentSoundFile.play();
             } else {
                 $(this).html(playButtonTemplate);
                 $('.main-controls .play-pause').html(playerBarPlayButton);
                 currentSoundFile.pause();   
             }

        }
    };
    
  var onHover = function(event) {
      var songNumberCell = $(this).find('.song-item-number');
      var songNumber = parseInt(songNumberCell.attr('data-song-number'));

      if (songNumber !== currentlyPlayingSongNumber) {
          songNumberCell.html(playButtonTemplate);
      }
  };

  var offHover = function(event) {
      var songNumberCell = $(this).find('.song-item-number');
      var songNumber = parseInt(songNumberCell.attr('data-song-number'));

      if (songNumber !== currentlyPlayingSongNumber) {
          songNumberCell.html(songNumber);
      }
  };

  $row.find('.song-item-number').click(clickHandler);
  $row.hover(onHover, offHover);
  return $row;

};

var setCurrentAlbum = function(album) {

  currentAlbum = album;
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  $albumTitle.text(album.name);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);

  $albumSongList.empty();

  // Loop through each song in the album
  for (i = 0; i < album.songs.length; i++) {
    var $newRow = createSongRow(i + 1, album.songs[i].name, album.songs[i].length);
    $albumSongList.append($newRow);
  }

};

var setCurrentTimeInPlayerBar = function(currentTime) {
    var $currentTimeElement = $('.seek-control .current-time');
    $currentTimeElement.text(currentTime);
};

var setTotalTimeInPlayerBar = function(totalTime) {
    var $totalTimeElement = $('.seek-control .total-time');
    $totalTimeElement.text(totalTime);
};

var filterTimeCode = function(timeInSeconds) {
    var seconds = Number.parseFloat(timeInSeconds);
    var wholeSeconds = Math.floor(seconds);
    var minutes = Math.floor(wholeSeconds / 60);
    var remainingSeconds = wholeSeconds % 60;
    
    var output = minutes + ':';
    
    if (remainingSeconds < 10) {
        output += '0';
    }
    
    output += remainingSeconds;
    
    return output;
};

var updateSeekBarWhileSongPlays = function() {
   if (currentSoundFile) {

       currentSoundFile.bind('timeupdate', function(event) {
           var currentTime = this.getTime();
           var songLength = this.getDuration();
           var seekBarFillRatio = this.getTime() / this.getDuration();
           var $seekBar = $('.seek-control .seek-bar');

           updateSeekPercentage($seekBar, seekBarFillRatio);
           setCurrentTimeInPlayerBar(filterTimeCode(currentTime));

       });

   }
};

// Method to update the seek bars
var updateSeekPercentage = function($seekBar, seekBarFillRatio) {

  // Multiply the fill ratio by 100 to determine a percentage
  var offsetXPercent = seekBarFillRatio * 100;

  // Make sure our percentage isn't less than zero
  offsetXPercent = Math.max(0, offsetXPercent);
  // Make sure our percentage doesn't exceed 100%
  offsetXPercent = Math.min(100, offsetXPercent);

  // Convert the percentage to a string and add the % character
  var percentageString = offsetXPercent + '%';

  // Apply the percentage to the element's CSS
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});

};

// Method for determining the seekBarFillRatio in updateSeekPercentage
var setupSeekBars = function(){

  var $seekBars = $('.player-bar .seek-bar');

  $seekBars.click(function(event){

    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();

    var seekBarFillRatio = offsetX / barWidth;

  if( $(this).parent().hasClass('seek-control') ){

    // Skip to the seekbar percent in the song
    seek(seekBarFillRatio * currentSoundFile.getDuration());

  } else {

    // Set the volume based on the seek bar position
    setVolume(seekBarFillRatio * 100);
  }

  updateSeekPercentage($(this), seekBarFillRatio);

  });

  $seekBars.find('.thumb').mousedown(function(event) {

    var $seekBar = $(this).parent();

    $(document).bind('mousemove.thumb', function(event){
      var offsetX = event.pageX - $seekBar.offset().left;
      var barWidth = $seekBar.width();
      var seekBarFillRatio = offsetX / barWidth;

      if( $(this).parent().hasClass('seek-control') ){

        // Skip to the seekbar percent in the song
        seek(seekBarFillRatio * currentSoundFile.getDuration());
      } else {

        // Set the volume based on the seek bar position
        setVolume(seekBarFillRatio);

      }

      updateSeekPercentage($seekBar, seekBarFillRatio);
    });

    $(document).bind('mouseup.thumb', function() {
      $(document).unbind('mousemove.thumb');
      $(document).unbind('mouseup.thumb');
    });

 });
};

// Helper method to return the index of a song in the album's songs array
var trackIndex = function(album, song){
    return album.songs.indexOf(song);
};

var nextSong = function() {

  // Function to help get the last song number so that we can
  // update the HTML of the previous song's number
  var getLastSongNumber = function(index) {
    return index === 0 ? currentAlbum.songs.length : index;
  };

  // Use the trackIndex() helper function to get the index of the current song and
  // then increment the value of the index.
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  currentSongIndex++;

  // If it's the last song, wrap it back around to the first song in the index
  if (currentSongIndex >= currentAlbum.songs.length) {
    currentSongIndex = 0;
  }

  // Set the new currently playing song number. Adding 1 to account for array starting at 0.
  setSong(currentSongIndex + 1);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

  // Update the Player Bar information
  $('.currently-playing .song-name').text(currentSongFromAlbum.name);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.name);
  $('.left-controls .play-pause').html(playerBarPauseButton);

  var lastSongNumber = getLastSongNumber(currentSongIndex);
  var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

  $nextSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSongNumber);

};

var previousSong = function() {

    // Note the difference between this implementation and the one in
    // nextSong()
    var getLastSongNumber = function(index) {
      return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
    };

    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _decrementing_ the index here
    currentSongIndex--;

    if (currentSongIndex < 0) {
      currentSongIndex = currentAlbum.songs.length - 1;
    }

    // Set a new current song
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

    // Update the Player Bar information
    $('.currently-playing .song-name').text(currentSongFromAlbum.name);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.name);
    $('.left-controls .play-pause').html(playerBarPauseButton);

    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);

};

var updatePlayerBarSong = function(){

  // Set the content of the current song playing in the player bar
  $('.currently-playing .song-name').text(currentSongFromAlbum.name);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.artist);

  // Change the play button to a pause button for the currently playing song
  $('.main-controls .play-pause').html(playerBarPauseButton);
    
  setTotalTimeInPlayerBar(filterTimeCode(currentSongFromAlbum.length));

};

// Combining instances of repeating variables
var setSong = function(songNumber){

  // Prevents concurrent playback
  if( currentSoundFile ){
    currentSoundFile.stop();
  }

  currentlyPlayingSongNumber = songNumber;
  currentSongFromAlbum = currentAlbum.songs[currentlyPlayingSongNumber - 1];

  // Create a new Buzz sound object and pass it
  // the audioUrl property of the currentSongFromAlbum object
  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    formats: [ 'mp3' ],
    preload: true
  });

  setVolume(currentVolume);

};

var seek = function(time) {
  if (currentSoundFile) {
    currentSoundFile.setTime(time);
  }
};

var setVolume = function(volume){
  if(currentSoundFile){
      currentSoundFile.setVolume(volume);
  }
};

// Simplifying the data attribute assignment
var getSongNumberCell = function(songNumber) {

    return $('.song-item-number[data-song-number="' + songNumber + '"]');

};

// Album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

// Store state of songs
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

$(document).ready( function() {

  setCurrentAlbum(albumPicasso);
  setupSeekBars();

  $previousButton.click(previousSong);
  $nextButton.click(nextSong);

});