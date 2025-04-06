# Utility file to perform things in dev.


#############
# Functions #
#############


def getAlternateStylesForSVG():
    styles = [
        {"name": "black", "color1": "2b2b2b", "color2": "444444"},
        {"name": "cyan", "color1": "00bfbf", "color2": "9acee6"},
        {"name": "blue", "color1": "9acee6", "color2": "BF7E96"},
        {"name": "green", "color1": "619E73", "color2": "B1FFFF"},
        {"name": "purple", "color1": "AF84A3", "color2": "9acee6"},
        {"name": "red", "color1": "d10c0c", "color2": "BF7E96"},
    ]

    print("Path should be ../public")
    svg_name = input("Enter the SVG name:")
    svg_style = svg_name.split("-")[1].split(".")[0]
    svg_base_name = svg_name.split("-")[0]
    print(f"Using {svg_style} as base style to set others from")
    chosen_style = [style for style in styles if style["name"] == svg_style][0]
    styles = [style for style in styles if style["name"] != svg_style]
    with open(f"./public/{svg_name}", "r") as svg:
        svg_format = svg.read()
    for style in styles:
        with open(f"./public/{svg_base_name}-{style['name']}.svg", "w+") as new_svg:
            contents = svg_format.replace(
                chosen_style["color1"], style["color1"]
            ).replace(chosen_style["color2"], style["color2"])
            new_svg.write(contents)
        print(
            f"""{{ name: "{svg_base_name.title()} ({style['name'].title()})", imageLink: "{svg_base_name}-{style['name']}.svg" }},"""
        )


###########
# Options #
###########

options = [
    {
        "id": 0,
        "name": "Get alternative color styles for an SVG",
        "function": getAlternateStylesForSVG,
    }
]

##################
# User Interface #
##################
print("""Welcome to the ultity file for data tracker!""")
print("-" * 20)
for option in options:
    print(option["id"], "-", option["name"])
print("-" * 20)
choice = input("Enter the number for a selection:")
for option in options:
    if option["id"] == int(choice):
        option["function"]()
