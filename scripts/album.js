// Example Album
 var albumPicasso = {
     name: 'The Colors',
     artist: 'Pablo Picasso',
     label: 'Cubism',
     year: '1881',
     albumArtUrl: 'assets/images/album_covers/01.png',
     songs: [
         { name: 'Blue', length: '4:26' },
         { name: 'Green', length: '3:14' },
         { name: 'Red', length: '5:01' },
         { name: 'Pink', length: '3:21'},
         { name: 'Magenta', length: '2:15'}
     ]
 };
 
 // Another Example Album
 var albumMarconi = {
     name: 'The Telephone',
     artist: 'Guglielmo Marconi',
     label: 'EM',
     year: '1909',
     albumArtUrl: 'assets/images/album_covers/20.png',
     songs: [
         { name: 'Hello, Operator?', length: '1:01' },
         { name: 'Ring, ring, ring', length: '5:01' },
         { name: 'Fits in your pocket', length: '3:21'},
         { name: 'Can you hear me now?', length: '3:14' },
         { name: 'Wrong phone number', length: '2:15'}
     ]
 };

 var albumAdele = {
     name: 'Adele 25',
     artist: 'Adele',
     label: 'XL',
     year: '2015',
     albumArtUrl: 'assets/images/album_covers/03.png',
     songs: [
         { name: 'Hello', length: '6:07' },
         { name: 'I Miss You', length: '3:01' },
         { name: 'When We Were Young', length: '5:21'},
         { name: 'Remedy', length: '4:14' },
         { name: 'All I Ask', length: '6:15'}
     ]
 };

var createSongRow = function(songNumber, songName, songLength) {
     var template =
        '<tr class="album-view-song-item">'
      + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
      + '  <td class="song-item-title">' + songName + '</td>'
      + '  <td class="song-item-duration">' + songLength + '</td>'
      + '</tr>'
      ;
 
      var $row = $(template);
    
        var clickHandler = function() {
          
            var songNumber = $(this).attr('data-song-number');

            if (currentlyPlayingSong !== null) {
                // Revert to song number for currently playing song because user started playing new song.
                var currentlyPlayingCell = $('.song-item-number[data-song-number="' + currentlyPlayingSong + '"]');
                currentlyPlayingCell.html(currentlyPlayingSong);
            }
            if (currentlyPlayingSong !== songNumber) {
                // Switch from Play -> Pause button to indicate new song is playing.
                $(this).html(pauseButtonTemplate);
                currentlyPlayingSong = songNumber;
            } else if (currentlyPlayingSong === songNumber) {
                // Switch from Pause -> Play button to pause currently playing song.
                $(this).html(playButtonTemplate);
                currentlyPlayingSong = null;
            }
        };
     
      var onHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = songNumberCell.attr('data-song-number');

        if (songNumber !== currentlyPlayingSong) {
            songNumberCell.html(playButtonTemplate);
        }
    };

      var offHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = songNumberCell.attr('data-song-number');

        if (songNumber !== currentlyPlayingSong) {
            songNumberCell.html(songNumber);
        }
    };
    
      // #1
      $row.find('.song-item-number').click(clickHandler);
      // #2
      $row.hover(onHover, offHover);
      // #3
      return $row;
 };



var setCurrentAlbum = function(album) {
    
    var albumTitle = document.getElementsByClassName('album-view-title')[0];
    var albumArtist = document.getElementsByClassName('album-view-artist')[0];
    var albumReleaseInfo = document.getElementsByClassName('album-view-release-info')[0];
    var albumImage = document.getElementsByClassName('album-cover-art')[0];
    var albumSongList = document.getElementsByClassName('album-view-song-list')[0];

     // #2
     albumTitle.firstChild.nodeValue = album.name;
     albumArtist.firstChild.nodeValue = album.artist;
     albumReleaseInfo.firstChild.nodeValue = album.year + ' ' + album.label;
     albumImage.setAttribute('src', album.albumArtUrl);
 
     // #3
     albumSongList.innerHTML = '';
 
     // #4
     for (i = 0; i < album.songs.length; i++) {
         albumSongList.innerHTML += createSongRow(i + 1, album.songs[i].name, album.songs[i].length);
     }
 };

var songListContainer = document.getElementsByClassName('album-view-song-list')[0];
var songRows = document.getElementsByClassName('album-view-song-item');

// Album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';

// Store state of playing songs
var currentlyPlayingSong = null;

//window.onload = function() {
 $(document).ready(function() {
     
  setCurrentAlbum(albumPicasso);
    
 /* var clickHandler = function(targetElement) {
      var songItem = getSongItem(targetElement);  
      
      if (currentlyPlayingSong === null) {
         songItem.innerHTML = pauseButtonTemplate;
         currentlyPlayingSong = songItem.getAttribute('data-song-number');
     } else if (currentlyPlayingSong === songItem.getAttribute('data-song-number')) {
         songItem.innerHTML = playButtonTemplate;
         currentlyPlayingSong = null;
     } else if (currentlyPlayingSong !== songItem.getAttribute('data-song-number')) {
         var currentlyPlayingSongElement = document.querySelector('[data-song-number="' + currentlyPlayingSong + '"]');
         currentlyPlayingSongElement.innerHTML = currentlyPlayingSongElement.getAttribute('data-song-number');
         songItem.innerHTML = pauseButtonTemplate;
         currentlyPlayingSong = songItem.getAttribute('data-song-number');
     }*/
      
  };    

 /* songListContainer.addEventListener('mouseover', function(event) {
       // Only target individual song rows during event delegation
         if (event.target.parentElement.className === 'album-view-song-item') {
             
             // Change the content from the number to the play button's HTML
         event.target.parentElement.querySelector('.song-item-number').innerHTML = playButtonTemplate;
             
           var songItem = getSongItem(event.target);

           if (songItem.getAttribute('data-song-number') !== currentlyPlayingSong) {
              songItem.innerHTML = playButtonTemplate;
           }
         // #1 Mouse over the table, and the element where the event is dispatched will be logged to the console.
        //console.log(event.target);
        }
  }); */   
    
   for (i = 0; i < songRows.length; i++) {
        /* songRows[i].addEventListener('mouseleave', function(event) {
             // Revert the content back to the number
             // Selects first child element, which is the song-item-number element
             //this.children[0].innerHTML = this.children[0].getAttribute('data-song-number');
             // #1
             var songItem = getSongItem(event.target);
             var songItemNumber = songItem.getAttribute('data-song-number');
 
             // #2
             if (songItemNumber !== currentlyPlayingSong) {
                 songItem.innerHTML = songItemNumber;
             }

         });*/
    
    
         songRows[i].addEventListener('click', function(event) {
             // Event handler call
            clickHandler(event.target);
         });
     }
 });
  var index = 0;
  var albumImage = document.getElementsByClassName('album-cover-art')[0];
  var albums = [albumMarconi, albumPicasso, albumAdele];

  albumImage.addEventListener("click", function( event ) {

    setCurrentAlbum(albums[index]);

    index++;

    if( index === albums.length ){
      index = 0;
    }

  }, false);

};

/*var findParentByClassName = function(element, targetClass){

  // Assign the element's parent that we're checking to a variable
  var existingParent = element.parentElement;

  // If the element's parent class that we're on isn't the same as the target class we want,
  // move to the next parent element up.
  while(existingParent.className != targetClassClass){
    existingParent = existingParent.parentElement;
  }

  // Returns the parent element we want because the loop above stops
  // once our desired class is found.
  return currentParent;

};

var findParentByClassName = function(element, targetClass){
  // Assign the element's parent that we're checking to a variable
  var existingParent = element.parentElement;
  // Check if the current parent exists
  if (existingParent) {
    // If the element's parent class that we're on isn't the same as the target class we want,
    // move to the next parent element up
    while( existingParent.className && existingParent.className != targetClass ){
      existingParent = existingParent.parentElement;
    }
    // Return the current parent when a match is found
    if( existingParent.className === targetClass ) {
      return existingParent;
    // Otherwise alert that there was no class match
    } else {
      alert("No parent found with that class name");
    }
  // If parent doesn't exist
  } else {
    alert("No Parent Found");
  }
};


// Always return the song item regardless of the song element selected
var getSongItem = function(element) {

  switch (element.className) {
    case 'album-song-button':
    case 'ion-play':
    case 'ion-pause':
      return findParentByClassName(element, 'song-item-number');
      break;
    case 'album-view-song-item':
      return element.querySelector('.song-item-number');
      break;
    case 'song-item-title':
    case 'song-item-duration':
      return findParentByClassName(element, 'album-view-song-item').querySelector('.song-item-number');
      break;
    case 'song-item-number':
      return element;
      break;
    default:
      return;
  }

};*/
