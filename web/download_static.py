import requests
import io
import os
import zipfile


static_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'static')

files = [
    {
        'url': 'https://github.com/uikit/uikit/releases/download/v3.0.3/uikit-3.0.3.zip',
        'dest': os.path.join(static_dir, 'lib/uikit/'),
    },
    {
        'url': 'https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.js',
        'dest': os.path.join(static_dir, 'lib/axios/axios.js'),
    },
    {
        'url': 'https://d3js.org/d3.v3.js',
        'dest': os.path.join(static_dir, 'lib/d3/d3.v3.js'),
    },
    {
        'url': 'https://cdnjs.cloudflare.com/ajax/libs/d3-cloud/1.2.5/d3.layout.cloud.js',
        'dest': os.path.join(static_dir, 'lib/d3-cloud/d3.layout.cloud.js'),
    },
    {
        'url': 'https://cdnjs.cloudflare.com/ajax/libs/awesomplete/1.1.4/awesomplete.js',
        'dest': os.path.join(static_dir, 'lib/awesomplete/awesomplete.js'),
    }
]


def download_file(url, dest, mode='wb'):
    r = requests.get(url)
    if not os.path.exists(os.path.dirname(dest)):
        os.makedirs(os.path.dirname(dest))
    with open(dest, mode) as f:
        f.write(r.content)


def download_zip(url, dest):
    r = requests.get(url)
    if not os.path.exists(dest):
        os.makedirs(dest)
    with zipfile.ZipFile(io.BytesIO(r.content)) as thezip:
        thezip.extractall(dest)


if __name__ == '__main__':
    print(static_dir)
    for file_data in files:
        print("Downloading: " + file_data['url'])
        if file_data['url'][-3:] == 'zip':
            download_zip(**file_data)
        else:
            download_file(**file_data)
        print("Saved: " + file_data['dest'])
    print('Done.')
