  // Load and play video on click
  const videoWrapper = document.getElementById('video-wrapper');
  const thumbnail = document.getElementById('video-thumbnail');
  const iframe = document.getElementById('video-iframe');

  videoWrapper.addEventListener('click', () => {
    iframe.src = "https://salvationarmysouth.widen.net/view/video/h8kd3dzcou/Stories-Testimonial-Recording-Invitation-Instagram-Version-2.mp4?t.download=true&u=ukifzm";
    iframe.style.display = 'block';
    thumbnail.style.display = 'none';
    videoWrapper.style.cursor = 'default';
  });

  // Auto Increasing Likes & Comments
  let likeCount = 1;
  let commentCount = 4;
  const likeEl = document.getElementById('like-count');
  const commentEl = document.getElementById('comment-count');

  const likeInterval = setInterval(() => {
    if (likeCount < 2000) {
      likeCount += Math.floor(Math.random() * 5);
      likeEl.textContent = likeCount.toLocaleString();
    } else {
      clearInterval(likeInterval);
    }
  }, 250);

  const commentInterval = setInterval(() => {
    if (commentCount < 1500) {
      commentCount += Math.floor(Math.random() * 2);
      commentEl.textContent = commentCount.toLocaleString();
    } else {
      clearInterval(commentInterval);
    }
  }, 500);

  // Toast-style comments
  const comments = [
    { user: 'faithbuilder1', text: 'Absolutely love this campaign!' },
    { user: 'hope_rising', text: 'So good to see testimonies featured.' },
    { user: 'campfirestory', text: 'Reminds me of TAP sessions ❤️' },
  ];
  let commentIndex = 0;

  function toastComment(comment) {
    const commentHTML = `<div style="margin-bottom: 6px;"><strong>@${comment.user}</strong>: ${comment.text}</div>`;
    document.getElementById('comments-feed').insertAdjacentHTML('beforeend', commentHTML);
  }

  const commentFeedInterval = setInterval(() => {
    if (commentIndex < comments.length) {
      toastComment(comments[commentIndex++]);
    }
  }, 2500);

  // Expose method to inject real comments
  function addRealComment(user, text) {
    toastComment({ user, text });
  }
