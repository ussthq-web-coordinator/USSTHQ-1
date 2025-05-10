  document.addEventListener('DOMContentLoaded', function () {
    const videoWrapper = document.getElementById('video-wrapper');
    const video = document.getElementById('video-element');
    const thumbnail = document.getElementById('video-thumbnail');

    videoWrapper.addEventListener('click', () => {
      thumbnail.style.display = 'none';
      video.style.display = 'block';
      video.play();
      videoWrapper.style.cursor = 'default';
    });

    // Auto-incrementing counters
    let likeCount = 1, commentCount = 4;
    const likeEl = document.getElementById('like-count');
    const commentEl = document.getElementById('comment-count');

    const likeInterval = setInterval(() => {
      if (likeCount < 2000) {
        likeCount += Math.floor(Math.random() * 5);
        likeEl.textContent = likeCount.toLocaleString();
      } else {
        clearInterval(likeInterval);
      }
    }, 200);

    const commentInterval = setInterval(() => {
      if (commentCount < 1500) {
        commentCount += Math.floor(Math.random() * 3);
        commentEl.textContent = commentCount.toLocaleString();
      } else {
        clearInterval(commentInterval);
      }
    }, 300);

    // Comment toasting
    const comments = [
      { user: 'allycat', text: 'This is exactly what I needed today ❤️' },
      { user: 'hopeforall', text: 'So inspiring!' },
      { user: 'txsummers', text: 'We shared this at our corps!' },
    ];
    let commentIndex = 0;

    function toastComment(comment) {
      const html = `<div style="margin-bottom:6px;"><strong>@${comment.user}</strong>: ${comment.text}</div>`;
      document.getElementById('comments-feed').insertAdjacentHTML('beforeend', html);
    }

    setInterval(() => {
      if (commentIndex < comments.length) {
        toastComment(comments[commentIndex++]);
      }
    }, 2500);

    // Add real comments with: window.addRealComment('user', 'text')
    window.addRealComment = function (user, text) {
      toastComment({ user, text });
    };
  });