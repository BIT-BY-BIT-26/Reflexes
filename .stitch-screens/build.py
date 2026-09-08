import base64, os, html

D = os.path.dirname(os.path.abspath(__file__))

items = [
 dict(f="01-login-gateway.png", t="mediReach Unified Login & Multi-Role Gateway", w=2560, h=2140,
      id="0c3edc3a41b64a72a73021c7008df0d4", role="All roles", kind="screen"),
 dict(f="02-find-doctors-book-opd.png", t="Find Doctors & Book Online OPD", w=2560, h=4336,
      id="3465af14c79c4c109ef24aaf3d548f86", role="Patient", kind="screen"),
 dict(f="03-patient-health-vault.png", t="Patient Health Vault & Prescription Upload", w=2560, h=3862,
      id="19544ab2a1f64505bc6862f7cbf6201a", role="Patient", kind="screen"),
 dict(f="04-doctor-appointments.png", t="Doctor Appointments & Daily Schedule", w=2560, h=3136,
      id="38595bacf07e430990d782a0544ccde7", role="Doctor", kind="screen"),
 dict(f="05-tele-consultation-console.png", t="Live Online OPD Tele-Consultation Console", w=2560, h=2048,
      id="f3ad726c0a954f16900529beac0441a7", role="Doctor", kind="screen"),
 dict(f="06-hospital-doctor-management.png", t="Hospital Doctor Management & Staff Directory", w=2560, h=3872,
      id="5092a56f20a24616b2f15c3f4f80a218", role="Hospital admin", kind="screen"),
 dict(f="07-hospital-central-appointments.png", t="Hospital Central Appointments & OPD Scheduling", w=2560, h=3538,
      id="90289aa85cd04eb982dc53c5cd117680", role="Hospital admin", kind="screen"),
 dict(f="08-asset-logo.png", t="mediReach Logo", w=1376, h=768,
      id="80a0416d03464131ae171b643d1dda35", role="Brand mark", kind="asset"),
 dict(f="09-asset-doctor-headshot.png", t="Doctor headshot", w=1024, h=1024,
      id="dddcaca828514cb1a9cef5341bbb7c18", role="Portrait", kind="asset",
      prompt="Professional medical headshot of a friendly confident male doctor in a white lab coat with stethoscope around neck, warm smile, hospital office blurred background, realistic clinical lighting"),
 dict(f="10-asset-patient-avatar.png", t="Patient avatar", w=1024, h=1024,
      id="90beb0f0031b4c6aa6e319000aefdbc0", role="Portrait", kind="asset",
      prompt="Friendly smiling female patient portrait avatar for healthcare app, natural lighting, professional casual attire, clean modern background"),
]

for it in items:
    with open(os.path.join(D, it["f"]), "rb") as fh:
        it["uri"] = "data:image/png;base64," + base64.b64encode(fh.read()).decode()


def card(it, n=None):
    e = html.escape
    prompt = '<p class="prompt">%s</p>' % e(it["prompt"]) if it.get("prompt") else ""
    code = ('<span class="chip code">HTML</span>' if it["kind"] == "screen"
            else '<span class="chip img">Image only</span>')
    num = '<span class="num">%02d</span>' % n if n else ""
    return """      <figure class="card {kind}">
        <button class="shot" type="button" data-src="{uri}" data-title="{tt}" aria-label="Open {tt} full size">
          <img src="{uri}" alt="{tt}" loading="lazy">
        </button>
        <figcaption>
          <div class="cap-top">{num}<h3>{tt}</h3></div>
          {prompt}
          <div class="meta">
            <span class="chip role">{role}</span>{code}
            <span class="dim">{w}&thinsp;&times;&thinsp;{h}</span>
          </div>
          <div class="sid">{sid}</div>
        </figcaption>
      </figure>""".format(kind=it["kind"], uri=it["uri"], tt=e(it["t"]), num=num, prompt=prompt,
                          role=e(it["role"]), code=code, w=it["w"], h=it["h"], sid=it["id"])


screens = "\n".join(card(it, i + 1) for i, it in enumerate(items[:7]))
assets = "\n".join(card(it) for it in items[7:])

with open(os.path.join(D, "template.html"), encoding="utf-8") as fh:
    tpl = fh.read()

doc = tpl.replace("<!--SCREENS-->", screens).replace("<!--ASSETS-->", assets)
out = os.path.join(D, "medireach-screens.html")
with open(out, "w", encoding="utf-8") as fh:
    fh.write(doc)
print(out, os.path.getsize(out) // 1024, "KB")
