import functools


def addon_json(f):
    @functools.wraps(f)
    def wrapper(*args, **kw):
        response = f(*args, **kw)
        return list(small_addons(response))
    return wrapper


def small_addons(addons):
    for addon in addons:
        row = {
            'id': addon.id,
            'name': unicode(addon.name),
            'icon': addon.get_icon_url(size=64),
        }
        yield row