/* ------------------------------------------------------------------
   NeuroFit Swipe Engine
   ------------------------------------------------------------------
   Turns any element into a swipeable card with:
   • Touch + mouse drag support
   • Direction detection (left / right)
   • Smooth snap-back animation if insufficient force
   • Callbacks for onLeft() and onRight()
   ------------------------------------------------------------------ */

function SwipeCard(card, opts = {}) {
  let startX = 0;
  let currentX = 0;
  let dragging = false;

  const onLeft  = opts.onLeft  || (()=>{});
  const onRight = opts.onRight || (()=>{});

  const threshold = 80;   // px required to trigger a decision
  const rotateMax = 18;   // degrees

  /* ------------------------------
     POINTER DOWN
     ------------------------------ */
  function handleDown(e){
    dragging = true;
    startX = getX(e);
    currentX = startX;
    card.style.transition = 'none';
  }

  /* ------------------------------
     POINTER MOVE
     ------------------------------ */
  function handleMove(e){
    if(!dragging) return;
    currentX = getX(e);
    const dx = currentX - startX;

    // position card
    const rotate = (dx / 200) * rotateMax;
    card.style.transform = `translateX(${dx}px) rotate(${rotate}deg)`;
  }

  /* ------------------------------
     POINTER UP
     ------------------------------ */
  function handleUp(e){
    if(!dragging) return;
    dragging = false;

    const dx = currentX - startX;
    const absDx = Math.abs(dx);

    // Decide
    if(absDx > threshold){
      // animate off-screen
      const direction = dx > 0 ? 1 : -1;
      card.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
      card.style.transform  = `translateX(${direction * 350}px) rotate(${direction * rotateMax}deg)`;
      card.style.opacity = '0';

      setTimeout(()=>{
        if(direction > 0) onRight();
        else onLeft();
      }, 200);

    } else {
      // Snap back
      card.style.transition = 'transform 0.25s ease';
      card.style.transform = 'translateX(0px) rotate(0deg)';
    }
  }

  /* ------------------------------
     HELPERS
     ------------------------------ */
  function getX(e){
    if(e.touches && e.touches.length > 0){
      return e.touches[0].clientX;
    }
    return e.clientX;
  }

  /* ------------------------------
     EVENT LISTENERS
     ------------------------------ */
  card.addEventListener('mousedown', handleDown);
  card.addEventListener('mousemove', handleMove);
  card.addEventListener('mouseup', handleUp);
  card.addEventListener('mouseleave', handleUp);

  card.addEventListener('touchstart', handleDown, {passive:true});
  card.addEventListener('touchmove', handleMove, {passive:true});
  card.addEventListener('touchend', handleUp);

  /* Prevent context menu (long‑press) */
  card.addEventListener('contextmenu', e=>e.preventDefault());
}
``
