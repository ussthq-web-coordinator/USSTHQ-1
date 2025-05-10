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

    let commentIndex = 0;
    const comments = [
      { user: 'allycat', text: 'This is exactly what I needed today ❤️' },
      { user: 'hopeforall', text: 'So inspiring!' },
      { user: 'txsummers', text: 'We shared this at our corps!' },
    ];

    let likeCount = 1, commentCount = 4;
    let likeInterval, commentInterval, commentLoop;
    let hasStarted = false;

    function showNextComment() {
      const comment = comments[commentIndex % comments.length];
      commentFeed.innerHTML = `<strong>@${comment.user}</strong>: ${comment.text}`;
      commentIndex++;
    }

    function startCountersAndComments() {
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
      if (hasStarted) return;
      hasStarted = true;

      thumbnailContainer.style.display = 'none';
      video.style.display = 'block';
      overlay.style.display = 'block';
      video.play();
      startCountersAndComments();
    }

    thumbnailContainer.addEventListener('click', startVideo);
    thumbnailContainer.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        startVideo();
      }
    });

    // Hover UI shift
    videoWrapper.addEventListener('mouseenter', () => {
      if (hasStarted) overlay.style.transform = 'translateY(-50px)';
    });
    videoWrapper.addEventListener('mouseleave', () => {
      if (hasStarted) overlay.style.transform = 'translateY(0)';
      moreActionsMenu.style.display = 'none';
    });

    // More actions toggle
    moreActionsToggle.addEventListener('click', e => {
      e.stopPropagation();
      moreActionsMenu.style.display =
        moreActionsMenu.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', () => {
      moreActionsMenu.style.display = 'none';
    });

    // Public method to inject real comments dynamically
    window.addRealComment = function (user, text) {
      comments.unshift({ user, text });
    };
  });
