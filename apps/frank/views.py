import jingo
import amo
from amo.decorators import json_view
from frank.decorators import addon_json
from addons.models import Addon, FrozenAddon

def home(request):
  return jingo.render(request, 'frank/home.html', {})


@json_view
@addon_json
def popular(request):
  # Add-ons.
  base = Addon.objects.listed(request.APP).filter(type=amo.ADDON_EXTENSION)
  # This is lame for performance. Kill it with ES.
  frozen = FrozenAddon.objects.values_list('addon', flat=True)
  popular = base.exclude(id__in=frozen).order_by('-average_daily_users')
  return popular[:24]


