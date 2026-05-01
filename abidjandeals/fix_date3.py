filepath = 'src/app/ad/[id]/page.tsx'

with open(filepath, 'rb') as f:
    raw = f.read()

# Find Date.now in bytes
idx = raw.find(b'Date.now')
if idx >= 0:
    chunk = raw[idx-15:idx+60]
    print("Hex bytes:")
    print(chunk.hex())
    print("Repr:")
    print(repr(chunk))
    
    # Now fix: replace everything between Math.floor(( and () - new
    # by finding the exact byte pattern
    start = raw.find(b'Math.floor((', idx-100)
    end = raw.find(b'() - new Date', idx)
    
    if start >= 0 and end >= 0:
        bad_chunk = raw[start+12:end+2]  # content between Math.floor(( and ()
        print(f"\nBad chunk: {repr(bad_chunk)}")
        
        # Replace the entire timeAgo line
        fixed = raw[:start+12] + b'Date.now' + raw[end:]
        with open(filepath, 'wb') as f:
            f.write(fixed)
        print("\nSUCCESS: Fixed!")
    else:
        print(f"\nstart={start}, end={end}")
else:
    print("Date.now not found in bytes!")
