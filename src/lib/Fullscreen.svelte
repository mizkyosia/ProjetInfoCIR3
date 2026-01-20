<!-- Fullscreen.svelte -->

<script>
  import { onMount } from "svelte";

  // define initial component state
  export let isFull = false;
  let fsContainer = null;

  // boring plain js fullscreen support stuff below
  const noop = () => {};

  let fullscreenSupport = false;

  let exitFullscreen = noop;

  const requestFullscreen = () => {
    const requestFS = (
      fsContainer.requestFullscreen ||
      fsContainer.mozRequestFullScreen ||
      fsContainer.webkitRequestFullscreen ||
      fsContainer.msRequestFullscreen ||
      noop
    ).bind(fsContainer);
    requestFS();
  };

  onMount(() => {
    fullscreenSupport = !!(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled ||
      false
    );

    exitFullscreen = (
      document.exitFullscreen ||
      document.mozCancelFullScreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen ||
      noop
    ).bind(document);

    // Add the icon stylesheet dynamically
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
    document.head.appendChild(link);

    const handleFullscreenChange = () => {
      isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    // remove the link when component is unmounted
    return () => {
      link.parentNode.removeChild(link);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  });

  // handler for the fullscreen button
  export const fsToggle = () => {
    if (!fullscreenSupport) return;

    if (isFull) {
      exitFullscreen();
    } else {
      requestFullscreen(fsContainer);
    }
  };

  // the icon name is computed automagically based
  // on the state of the screen
  $: icon = isFull ? "fullscreen_exit" : "fullscreen";
</script>

<style>
  .isFull {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
  }
  button {
    color: #000;
    position: absolute;
    right: 20px;
    bottom: 20px;
  }
</style>

<div class="fs" class:isFull bind:this={fsContainer}>
  <slot {isFull} />
  {#if fullscreenSupport}
    <button on:click={fsToggle}>
      <i class="material-icons md-36">{icon}</i>
    </button>
  {/if}
</div>
