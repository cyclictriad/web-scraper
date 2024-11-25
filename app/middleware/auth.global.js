// app/middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
  const userId = useCookie('_id').value;
  const setupRequired = useCookie('setup-required').value;
  const setupFlashcardSets = useCookie('setup-flashcards').value;

  // If not logged in and trying to access any non-auth page
  if (!userId && !to.path.startsWith('/auth')) {
    const returnTo = to.fullPath;
    return navigateTo(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
  }

  // If logged in (userId exists)
  if (userId) {
    // Prevent authenticated users from accessing /auth
    if (to.path.startsWith('/auth')) {
      const returnTo = to.query.returnTo || (from.path.startsWith('/auth') ? '/' : from.path);
      return navigateTo(returnTo);
    }

    // Handle setup states with priority
    if (setupRequired && to.path !== '/setup') {
      // Always prioritize setup_required and redirect to /setup
      return navigateTo('/setup');
    } else if (!setupRequired && setupFlashcardSets && to.path !== '/') {
      // Only redirect to home for setup_quizzes if setup_required is false
      return navigateTo('/');
    }
  } else {
    // Not logged in users can only access /auth
    if (!to.path.startsWith('/auth')) {
      const returnTo = to.fullPath;
      return navigateTo(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
    }
  }
});