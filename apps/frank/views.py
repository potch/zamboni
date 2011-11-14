import jingo

def home(request):
  return jingo.render(request, 'frank/home.html', {})