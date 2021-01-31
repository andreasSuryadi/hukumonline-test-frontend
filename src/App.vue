<template>
  <div class="container">
    <div id="app">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss">
$color-white: #ffffff;
$color-black: #000000;
$color-primary: #036C72;
$color-primary-invert: findColorInvert($color-primary);
$color-primary-light: #036C72dd;
$color-success: #4EC776;
$color-success-invert: findColorInvert($color-success);
$color-danger: #ff1414;
$color-danger-invert: findColorInvert($color-danger);

$colors: (
  'white': (
    $color-white,
    $color-black,
  ),
  'black': (
    $color-black,
    $color-white,
  ),
  'primary': (
    $color-primary,
    $color-white,
    $color-primary-invert,
  ),
  'success': (
    $color-success,
    $color-white,
    $color-success-invert,
  ),
  'danger': (
    $color-danger,
    $color-white,
    $color-danger-invert,
  ),
);

.container {
  padding: 20px 5px;
}

// Import package
@import "~bulma/sass/utilities/_all";
@import "~bulma";
@import "~buefy/src/scss/buefy";
</style>