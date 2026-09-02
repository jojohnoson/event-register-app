
import os, sys, base64

path = sys.argv[1]
data = base64.b64decode(sys.argv[2].encode('ascii'))
with open(path, 'wb') as f:
    f.write(data)
print(f'Successfully wrote {path}')
