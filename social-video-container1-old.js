document.addEventListener('DOMContentLoaded', function () {
  const video = document.getElementById('video-element');
  const thumbnail = document.getElementById('video-thumbnail');
  const playButton = document.getElementById('custom-play-button');

  function startVideo() {
    thumbnail.style.display = 'none';
    playButton.style.display = 'none';
    video.style.display = 'block';
    video.play();
  }

  thumbnail.addEventListener('click', startVideo);
  playButton.addEventListener('click', startVideo);
});

document.addEventListener('DOMContentLoaded', function () {
  const videoWrapper = document.getElementById('video-wrapper');
  const video = document.getElementById('video-element');
  const thumbnailContainer = document.getElementById('video-thumbnail-container');
  const overlay = document.getElementById('overlay-ui');
  const moreActionsToggle = document.getElementById('more-actions-toggle');
  const moreActionsMenu = document.getElementById('more-actions-menu');
  const likeEl = document.getElementById('like-count');
  const commentEl = document.getElementById('comment-count');
  const commentFeed = document.getElementById('comments-feed');
  const playButton = document.getElementById('custom-play-button');

  let commentIndex = 0;
  const comments = [
    { user: 'allycat', text: 'This is exactly what I needed today ❤️' },
    { user: 'hopeforall', text: 'So inspiring!' },
    { user: 'txsummers', text: 'We shared this at our corps!' },
  ];

  let likeCount = 1, commentCount = 4;
  let likeInterval, commentInterval, commentLoop;

  overlay.style.display = 'none'; // Hide UI initially
  playButton.style.display = 'block'; // Ensure play button is visible

  function showNextComment() {
    const comment = comments[commentIndex % comments.length];
    commentFeed.innerHTML = `<strong>@${comment.user}</strong>: ${comment.text}`;
    commentIndex++;
  }

  function startCounters() {
    likeInterval = setInterval(() => {
      if (likeCount < 2000) {
        likeCount += Math.floor(Math.random() * 5);
        likeEl.textContent = likeCount.toLocaleString();
      } else clearInterval(likeInterval);
    }, 200);

    commentInterval = setInterval(() => {
      if (commentCount < 1500) {
        commentCount += Math.floor(Math.random() * 3);
        commentEl.textContent = commentCount.toLocaleString();
      } else clearInterval(commentInterval);
    }, 300);

    showNextComment();
    commentLoop = setInterval(showNextComment, 3000);
  }

  function startVideo() {
    thumbnailContainer.style.display = 'none';
    video.style.display = 'block';
    overlay.style.display = 'block';
    playButton.style.display = 'none';
    video.play();
    startCounters();
  }

  thumbnailContainer.addEventListener('click', startVideo);
  thumbnailContainer.addEventListener('keypress', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      startVideo();
    }
  });

  videoWrapper.addEventListener('mouseenter', () => {
    overlay.style.transform = 'translateY(-50px)';
  });
  videoWrapper.addEventListener('mouseleave', () => {
    overlay.style.transform = 'translateY(0)';
    moreActionsMenu.style.display = 'none';
  });

  moreActionsToggle.addEventListener('click', e => {
    e.stopPropagation();
    moreActionsMenu.style.display =
      moreActionsMenu.style.display === 'none' ? 'block' : 'none';
  });

  document.addEventListener('click', () => {
    moreActionsMenu.style.display = 'none';
  });

  window.addRealComment = function (user, text) {
    comments.unshift({ user, text });
  };
});