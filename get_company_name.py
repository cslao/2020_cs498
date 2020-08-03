import requests


def get_symbol(symbol):
    url = "http://d.yimg.com/autoc.finance.yahoo.com/autoc?query={}&region=1&lang=en".format(symbol)

    result = requests.get(url).json()

    for x in result['ResultSet']['Result']:
        if x['symbol'] == symbol:
            return x['name']

data_file = 'data/snp500_mcap_20200724.csv'

def update_file(fn):
    import csv
    my_data = []
    with open(fn, 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            my_data.append(row)

    new_fn = fn.replace('/', '/tmp_')
    has_desc_field = False
    with open(new_fn, 'w') as f:
        for row in my_data:
            symbol = row[0]
            if symbol == 'symbol':
                has_desc_field = row[-1] == 'desc'
                new_field = 'desc'
            else:
                if not has_desc_field or (has_desc_field and row[-1] == "NAN"):
                    try:
                        new_field = get_symbol(symbol)
                    except Exception:
                        print "Could not find data for {}".format(symbol)
                        new_field = "NAN"
                    if new_field is None:
                        print "Could not find data for {}".format(symbol)
                        new_field = "NAN"
                    else:
                        new_field = new_field.replace(",", "")

            if has_desc_field:
                row[-1] = new_field
            else:
                row.append(new_field)

            f.write(",".join(row) + "\n")

if __name__ == "__main__":
    from argparse import ArgumentParser
    parser = ArgumentParser()
    parser.add_argument('-f', '--filename', default=data_file)
    args = parser.parse_args()

    update_file(args.filename)
