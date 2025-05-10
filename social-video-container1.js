  const video = document.getElementById('hover-video');

  video.removeAttribute('controls');

  video.addEventListener('mouseenter', () => {
    video.setAttribute('controls', 'controls');
  });

  video.addEventListener('mouseleave', () => {
    video.removeAttribute('controls');
  });