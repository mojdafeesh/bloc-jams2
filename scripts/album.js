var createSongRow = function(songNumber, songName, songLength) {

   var template =
      '<tr class="album-view-song-item">' +
      '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>' +
      '  <td class="song-item-title">' + songName + '</td>' +
      '  <td class="song-item-duration">' + songLength + '</td>' +
      '</tr>';

  var $row = $(template);

  var clickHandler = function(){

    var $songDataAttr = parseInt($(this).attr('data-song-number'));

    // If a song is currently playing, revert that song button to the song's number
    if ( currentlyPlayingSongNumber !== null ) {

      var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);

      currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
      currentlyPlayingCell.html(currentlyPlayingSongNumber);

    }

    // If song clicked is not the currentlyPlayingSong,
    // make it the currentlyPlayingSong and display a pause button
    if (currentlyPlayingSongNumber !== $songDataAttr ){

      setSong($songDataAttr);
      $(this).html(pauseButtonTemplate);

      // Play the song that was clicked
      currentSoundFile.play();

      updateSeekBarWhileSongPlays();

      // Store the currently playing song name and length object
      currentSongFromAlbum = currentAlbum.songs[currentlyPlayingSongNumber - 1];

      var $volumeFill = $('.volume .fill');
      var $volumeThumb = $('.volume .thumb');
      $volumeFill.width(currentVolume + '%');
      $volumeThumb.css({left: currentVolume + '%'});

      $(this).html(pauseButtonTemplate);
      updatePlayerBarSong();

    // If clicking the currently playing song, revert the currentlyPlayingSong to null
    // and display the play button
    } else if (currentlyPlayingSongNumber === $songDataAttr ) {

      // Conditional statement that checks if the currentSoundFile is paused
      // Use Buzz's isPaused() method on currentSoundFile to check if the song is paused or not.
      if ( currentSoundFile.isPaused() ) {

        // Update the song's buttons to pause
        $(this).html(pauseButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPauseButton);

        // If song is paused, start playing the song again and revert the icon
        // in the song row and the player bar to the pause button.
        currentSoundFile.play();

        updateSeekBarWhileSongPlays();

      } else {

        // Update the song's buttons to play
        $(this).html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton);

        // If song isn't paused, pause the song and set the content
        // of the song number cell and player bar's pause button back to the play button.
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

var updateSeekBarWhileSongPlays = function() {
   if (currentSoundFile) {
       // #10
       currentSoundFile.bind('timeupdate', function(event) {
           // #11
           var seekBarFillRatio = this.getTime() / this.getDuration();
           var $seekBar = $('.seek-control .seek-bar');

           updateSeekPercentage($seekBar, seekBarFillRatio);
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