//from base64 import b64encode; open('b64', 'wb').write(b64encode(open('z3lightw.mid', 'rb').read()))
(function(window, $, MIDI, THREE, SPARKS) {
    function star(ctx, x, y, r, p, m) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        for (var i = 0; i < p*2; i+=2) {
            var angle = Math.PI / p * (i+1);
            var rad = r * m;
            var lx = x + Math.cos(angle) * rad;
            var ly = y + Math.sin(angle) * rad;
            ctx.lineTo(lx, ly);
            angle = Math.PI / p * (i+2);
            rad = r;
            var lx = x + Math.cos(angle) * rad;
            var ly = y + Math.sin(angle) * rad;
            ctx.lineTo(lx, ly);
        }
        ctx.fill();
        ctx.restore();
    }
    function generateSprite() {
        var canvas = document.createElement( 'canvas' );
        canvas.width = 128;
        canvas.height = 128;

        var context = canvas.getContext( '2d' );
        var gradient = context.createRadialGradient( canvas.width / 2,
                                                     canvas.height / 2,
                                                     0,
                                                     canvas.width / 2,
                                                     canvas.height / 2,
                                                     canvas.width / 2 );

        gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
        gradient.addColorStop( 0.2, 'rgba(255,255,255,1)' );
        gradient.addColorStop( 0.4, 'rgba(200,200,200,1)' );
        gradient.addColorStop( 1, 'rgba(0,0,0,1)' );

        context.fillStyle = gradient;
        star(context, canvas.width/2, canvas.height/2, (canvas.width + canvas.height)/4, 9, 0.2);

/*        document.body.appendChild(canvas);
        canvas.style.position = "absolute";
        canvas.style.top = canvas.style.left = 0; */
        return canvas;
    }

    var tetris = "data:audio/midi;base64,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";
    var zelda = "data:audio/midi;base64,TVRoZAAAAAYAAQAJAHhNVHJrAAAAGQD/WAQEAhgIAP9ZAgAAAP9RAwa7WAD/LwBNVHJrAAAKQwD/IQEAAP8DBExlYWQAwD0AsAd4AJBGZAA6ZABBZIE0QQAAOgAARgCBDEZkADpkAEFkFEEAADoAAEYAFDpkAEFkAEZkFEYAAEEAADoAFDpkAEFkAEZkFEYAAEEAADoAFDpkAEFkAEZkFEYAAEEAADoAFDpkAEFkAEZkMkYAAEEAADoAKDhkAD9kAERkFEQAAD8AADgACjpkAEFkAEZkeEYAAEEAADoAUEZkADpkAEFkFEEAADoAAEYAFDpkAEFkAEZkFEYAAEEAADoAFDpkAEFkAEZkFEYAAEEAADoAFDpkAEFkAEZkFEYAAEEAADoAFEZkADpkAEFkMkEAADoAAEYAKERkADhkAD9kFD8AADgAAEQACjpkAEFkAEZkeEYAAEEAADoAUDpkAEFkAEZkFEYAAEEAADoAFDpkAEFkAEZkFEYAAEEAADoAFDpkAEFkAEZkFEYAAEEAADoAFDpkAEFkAEZkFEYAAEEAADoAFDpkAEFkAEZkMkYAAEEAADoACjxkAEFkFEEAADwACjxkAEFkFEEAADwACkFkADxkFDwAAEEAKDxkAEFkFEEAADwACjxkAEFkFEEAADwACjxkAEFkFEEAADwAKDxkAEFkFEEAADwACjxkAEFkFEEAADwACjxkAEFkFEEAADwAKEFkADxkFDwAAEEAKD5kAEZkKEYAAD4AUDpkAEFkeEEAADoAUD5kAEZkFEYAAD4AFD5kAEZkFEYAAD4ACj9kAEhkFEgAAD8ACkFkAEpkFEoAAEEACkNkAEtkFEsAAEMACkRkAE1kgXBNAABEADxNZABEZB5EAABNAB5EZABNZBRNAABEABRGZABOZBROAABGABRIZABQZBRQAABIABRSZABJZIFwSQAAUgBQSWQAUmQUUgAASQAUSWQAUmQUUgAASQAUSGQAUGQUUAAASAAURmQATmQUTgAARgAUSGQAUGQoUAAASAAyRmQATmQUTgAARgAKRGQATWSBZk0AAEQACkRkAE1kPE0AAEQAPEJkAEtkHksAAEIAHkJkAEtkFEsAAEIACkRkAE1kFE0AAEQACkZkAE5kgXBOAABGAABEZABNZDJNAABEAApCZABLZDJLAABCAApBZABJZB5JAABBAB5BZABJZBRJAABBAApCZABLZBRLAABCAApEZABNZIFwTQAARAAAQmQAS2QySwAAQgAKQWQASWQySQAAQQAKQGQASGQeSAAAQAAeQGQASGQUSAAAQAAKSmQAQWQUQQAASgAKQ2QATGSBcEwAAEMAAEZkAE9keE8AAEYAAEVkAE1kHk0AAEUAHkFkFEEACkFkFEEACkFkFEEAKEFkFEEACkFkFEEACkFkFEEAKEFkFEEACkFkFEEACkFkFEEAKEFkFEEAKD5kAEZkKEYAAD4AUDpkAEFkeEEAADoAUD5kAEZkFEYAAD4AFD5kAEZkFEYAAD4ACj9kAEhkFEgAAD8ACkFkAEpkFEoAAEEACkNkAEtkFEsAAEMACkRkAE1kgXBNAABEADxNZABEZB5EAABNAB5EZABNZBRNAABEABRGZABOZBROAABGABRIZABQZBRQAABIABRSZABJZIFwSQAAUgB4TGQAVWRkVQAATAAUS2QAVGQoVAAASwBQSGQAUWSBcFEAAEgAAEVkAE1kZE0AAEUAFEZkAE5kgixOAABGADxJZABSZG5SAABJAApIZABRZChRAABIAFBFZABNZIFmTQAARQAKRWQATWRkTQAARQAURmQATmSCLE4AAEYAPElkAFJkblIAAEkACkhkAFFkKFEAAEgAUEVkAE1kgWZNAABFAApBZABKZGRKAABBABRCZABLZIJeSwAAQgAKRmQATmRuTgAARgAKRGQATWQyTQAARABGQWQASWSBZkkAAEEACj1kAEZkbkYAAD0ACkBkAEhkKEgAAEAAFEhkAEBkFEAAAEgACkpkAEFkFEEAAEoACkNkAExkgWZMAABDAApGZABPZG5PAABGAApFZABNZB5NAABFAB5BZBRBAApBZBRBAApBZBRBAChBZBRBAApBZBRBAApBZBRBAChBZBRBAApBZBRBAApBZBRBAChBZBRBACg+ZABGZChGAAA+AFA6ZABBZHhBAAA6AFA+ZABGZBRGAAA+ABQ+ZABGZBRGAAA+AAo/ZABIZBRIAAA/AApBZABKZBRKAABBAApDZABLZBRLAABDAApEZABNZIFwTQAARAA8TWQARGQeRAAATQAeRGQATWQUTQAARAAURmQATmQUTgAARgAUSGQAUGQUUAAASAAUUmQASWSBcEkAAFIAUElkAFJkFFIAAEkAFElkAFJkFFIAAEkAFEhkAFBkFFAAAEgAFEZkAE5kFE4AAEYAFEhkAFBkKFAAAEgAMkZkAE5kFE4AAEYACkRkAE1kgWZNAABEAApEZABNZDxNAABEADxCZABLZB5LAABCAB5CZABLZBRLAABCAApEZABNZBRNAABEAApGZABOZIFwTgAARgAARGQATWQyTQAARAAKQmQAS2QySwAAQgAKQWQASWQeSQAAQQAeQWQASWQUSQAAQQAKQmQAS2QUSwAAQgAKRGQATWSBcE0AAEQAAEJkAEtkMksAAEIACkFkAElkMkkAAEEACkBkAEhkHkgAAEAAHkBkAEhkFEgAAEAACkpkAEFkFEEAAEoACkNkAExkgXBMAABDAABGZABPZHhPAABGAABFZABNZB5NAABFAB5BZBRBAApBZBRBAApBZBRBAChBZBRBAApBZBRBAApBZBRBAChBZBRBAApBZBRBAApBZBRBAChBZBRBACg+ZABGZChGAAA+AFA6ZABBZHhBAAA6AFA+ZABGZBRGAAA+ABQ+ZABGZBRGAAA+AAo/ZABIZBRIAAA/AApBZABKZBRKAABBAApDZABLZBRLAABDAApEZABNZIFwTQAARAA8TWQARGQeRAAATQAeRGQATWQUTQAARAAURmQATmQUTgAARgAUSGQAUGQUUAAASAAUUmQASWSBcEkAAFIAeExkAFVkZFUAAEwAFEtkAFRkKFQAAEsAUEhkAFFkgXBRAABIAABFZABNZGRNAABFABRGZABOZIIsTgAARgA8SWQAUmRuUgAASQAKSGQAUWQoUQAASABQRWQATWSBZk0AAEUACkVkAE1kZE0AAEUAFEZkAE5kgixOAABGADxJZABSZG5SAABJAApIZABRZChRAABIAFBFZABNZIFmTQAARQAKQWQASmRkSgAAQQAUQmQAS2SCXksAAEIACkZkAE5kbk4AAEYACkRkAE1kMk0AAEQARkFkAElkgWZJAABBAAo9ZABGZG5GAAA9AApAZABIZChIAABAABRIZABAZBRAAABIAApKZABBZBRBAABKAApDZABMZIFmTAAAQwAKRmQAT2RuTwAARgAKRWQATWQeTQAARQAeQWQUQQAKQWQUQQAKQWQUQQAoQWQUQQAKQWQUQQAKQWQUQQAoQWQUQQAKQWQUQQAKQWQUQQAoQWQUQQAA/y8ATVRyawAABxAA/yEBAAD/AwRCYXNzAME6ALEHeACRMGSBNDAAPC5keC4AeCxkWiwAHjBkWjAAHixkWiwAgRYqZFoqAB4wZFowAB4qZFoqAIEWKWR4KQB4KWR4KQAAK2Q8KwAALWQ8LQAALmQ8LgA8LmQeLgAKLmQeLgAKLGQeLAAKLmQ8LgA8LmQ8LgA8LGQ8LAA8LGQeLAAKLGQeLAAKKmQeKgAKLGQ8LAA8LGQ8LAA8KmQ8KgA8KmQeKgAKKmQeKgAKKGQeKAAKKmQ8KgA8KmQ8KgA8MWQ8MQA8MWQeMQAKMWQeMQAKL2QeLwAKMWQ8MQA8MWQ8MQA8L2Q8LwA8L2QeLwAKL2QeLwAKLmQeLgAKL2Q8LwA8L2Q8LwA8LmQ8LgA8LmQeLgAKLmQeLgAKLGQeLAAKLmQ8LgA8LmQ8LgA8MGQ8MAA8MGQeMAAKMGQeMAAKLmQeLgAKMGQ8MAA8MGQeMAAKMGQeMAAKMGQeMAAKLWQeLQAeKWQUKQAKKWQUKQAKKWQUKQAoKWQUKQAKKWQUKQAKKWQUKQAoKWQUKQAKKWQUKQAKK2QoKwAULWQoLQAULmQ8LgA8LmQeLgAKLmQeLgAKLGQeLAAKLmQ8LgA8LmQ8LgA8LGQ8LAA8LGQeLAAKLGQeLAAKKmQeKgAKLGQ8LAA8LGQ8LAA8KmQ8KgA8KmQeKgAKKmQeKgAKKGQeKAAKKmQ8KgA8KmQ8KgA8KWQ8KQA8KWQeKQAKKWQeKQAKJ2QeJwAKKWQ8KQA8KWQ8KQA8KGQeKAAKLmQeLgAKMWQeMQAKNGQeNAAKOmQeOgAKPWQePQAKQGQ8QACBNEFkMkEARjVkADlkFDkAADUAFDVkADlkFDkAADUAFDVkADlkFDkAADUAFDVkADlkeDkAADUAeChkHigACi5kHi4ACjFkHjEACjRkHjQACjpkHjoACj1kHj0ACkBkPEAAgTRBZDJBAEY1ZAA5ZBQ5AAA1ABQ1ZAA5ZBQ5AAA1ABQ1ZAA5ZBQ5AAA1ABQ1ZAA5ZHg5AAA1AHgvZDwvADwvZB4vAAovZB4vAAouZB4uAAovZDwvADwvZDwvADwuZDwuADwuZB4uAAouZB4uAAosZB4sAAouZDwuADwuZDwuADwwZDwwADwwZB4wAAowZB4wAAouZB4uAAowZDwwADwwZB4wAAowZB4wAAowZB4wAAotZB4tAB4pZBQpAAopZBQpAAopZBQpACgpZBQpAAopZBQpAAopZBQpACgpZBQpAAopZBQpAAorZCgrABQtZCgtABQuZDwuADwuZB4uAAouZB4uAAosZB4sAAouZDwuADwuZDwuADwsZDwsADwsZB4sAAosZB4sAAoqZB4qAAosZDwsADwsZDwsADwqZDwqADwqZB4qAAoqZB4qAAooZB4oAAoqZDwqADwqZDwqADwxZDwxADwxZB4xAAoxZB4xAAovZB4vAAoxZDwxADwxZDwxADwvZDwvADwvZB4vAAovZB4vAAouZB4uAAovZDwvADwvZDwvADwuZDwuADwuZB4uAAouZB4uAAosZB4sAAouZDwuADwuZDwuADwwZDwwADwwZB4wAAowZB4wAAouZB4uAAowZDwwADwwZB4wAAowZB4wAAowZB4wAAotZB4tAB4pZBQpAAopZBQpAAopZBQpACgpZBQpAAopZBQpAAopZBQpACgpZBQpAAopZBQpAAorZCgrABQtZCgtABQuZDwuADwuZB4uAAouZB4uAAosZB4sAAouZDwuADwuZDwuADwsZDwsADwsZB4sAAosZB4sAAoqZB4qAAosZDwsADwsZDwsADwqZDwqADwqZB4qAAoqZB4qAAooZB4oAAoqZDwqADwqZDwqADwpZDwpADwpZB4pAAopZB4pAAonZB4nAAopZDwpADwpZDwpADwoZB4oAAouZB4uAAoxZB4xAAo0ZB40AAo6ZB46AAo9ZB49AApAZDxAAIE0QWQyQQBGNWQAOWQUOQAANQAUNWQAOWQUOQAANQAUNWQAOWQUOQAANQAUNWQAOWR4OQAANQB4KGQeKAAKLmQeLgAKMWQeMQAKNGQeNAAKOmQeOgAKPWQePQAKQGQ8QACBNEFkMkEARjVkADlkFDkAADUAFDVkADlkFDkAADUAFDVkADlkFDkAADUAFDVkADlkeDkAADUAeC9kPC8APC9kHi8ACi9kHi8ACi5kHi4ACi9kPC8APC9kPC8APC5kPC4APC5kHi4ACi5kHi4ACixkHiwACi5kPC4APC5kPC4APDBkPDAAPDBkHjAACjBkHjAACi5kHi4ACjBkPDAAPDBkHjAACjBkHjAACjBkHjAACi1kHi0AHilkFCkACilkFCkACilkFCkAKClkFCkACilkFCkACilkFCkAKClkFCkACilkFCkACitkKCsAFC1kKC0AAP8vAE1UcmsAAAsQAP8hAQAA/wMFRHJ1bXMAuQdkAJkmZBq5B1YHB1cFB1gDB1kJB1oKmSYAACZkALkHWw0HXAKZJgAAJmQNuQddApkmAAAmZAq5B14FmSYAACZkAbkHXwQHYAqZJgAAJmQGuQdhCZkmAAAmZAG5B2IHB2MHmSYAACZkALkHZAgHZQeZJgAAJmQAuQdmCgdnBZkmAAAmZAO5B2gKB2kCmSYAACZkBrkHagmZJgAAJmQAuQdrAwdsDJkmAAAmZA8mAAAmZA8mAGkmZB4mAAomZB4mAAomZB4mAAomZAC5B20aB1YHB1cFB1gDB1kJB1oKmSYAACZkALkHWw0HXAKZJgAAJmQNuQddApkmAAAmZAq5B14FmSYAACZkAbkHXwQHYAqZJgAAJmQGuQdhCZkmAAAmZAG5B2IHB2MHmSYAACZkALkHZAgHZQeZJgAAJmQAuQdmCgdnBZkmAAAmZAO5B2gKB2kCmSYAACZkBrkHagmZJgAAJmQAuQdrAwdsDJkmAAAmZA8mAAAmZA8mAGkmZB4mAAomZB4mAAomZB4mAAomZAC5B20aB1YHB1cFB1gDB1kJB1oKmSYAACZkALkHWw0HXAKZJgAAJmQNuQddApkmAAAmZAq5B14FmSYAACZkAbkHXwQHYAqZJgAAJmQGuQdhCZkmAAAmZAG5B2IHB2MHmSYAACZkALkHZAgHZQeZJgAAJmQAuQdmCgdnBZkmAAAmZAO5B2gKB2kCmSYAACZkBrkHagmZJgAAJmQAuQdrAwdsDJkmAAAmZA8mAAAmZA8mAGkmZB4mAAomZB4mAAomZB4mAAomZAAxZB4mAFoxAAAmZB4mAFomZAAxZB4mAFoxAAAmZB4mAB4mZB4mAB4mZB4mAFomZB4mAAomZB4mAAomZB4mAAomZB4mAB4mZB4mAB4mZBQmAAomZBQmAAomZBQmAAomZBQmAAomZB4mAFomZB4mAAomZB4mAAomZB4mAAomZB4mAB4mZB4mAB4mZBQmABQmZBQmABQmZBQmABQmZB4mAFomZB4mAAomZB4mAAomZB4mAAomZB4mAB4mZB4mAB4mZBQmABQmZBQmABQmZBQmABQmZB4mAFomZB4mAAomZB4mAAomZB4mAAomZB4mAB4mZB4mAB4mZBQmACgmZBQmACgmZB4mAFomZB4mAAomZB4mAAomZB4mAAomZB4mAB4mZB4mAB4mZBQmACgmZBQmACgmZB4mAFomZB4mAAomZB4mAAomZB4mAAomZB4mAB4mZB4mAB4mZBQmACgmZBQmACgmZB4mAFomZB4mAAomZB4mAAomZB4mAAomZB4mAB4mZB4mAB4mZBQmACgmZBQmACgmZB4mAB4mZBQmAAomZBQmAAomZBQmACgmZBQmAAomZBQmAAomZBQmACgmZBQmAAomZBQmAAomZBQmAAomZBQmAAomZBQmAAomZBQmAAomZB4mAFomZB4mAAomZB4mAAomZB4mAAomZB4mAB4mZB4mAB4mZBQmAAomZBQmAAomZBQmAAomZBQmAAomZB4mAFomZB4mAAomZB4mAAomZB4mAAomZB4mAB4mZB4mAB4mZBQmABQmZBQmABQmZBQmABQmZB4mAFomZB4mAAomZB4mAAomZB4mAAomZB4mAB4mZB4mAB4mZBQmABQmZBQmABQmZBQmABQmZB4mAFomZB4mAAomZB4mAAomZB4mAAomZB4mAB4mZB4mAB4mZBQmACgmZBQmACgmZB4mAFomZB4mAAomZB4mAAomZB4mAAi5B38CmSZkADFkHiYAVbkHZAWZMQAAJmQeJgBaJmQeJgBaJmQeJgAKJmQeJgAKJmQeJgAKJmQeJgAeJmQeJgAeJmQUJgAUJmQUJgAUJmQUJgAUJmQeJgBaJmQeJgAKJmQeJgAKJmQeJgAIuQd/ApkmZAAxZB4mAFa5B2QEmTEAACZkHiYAWiZkHiYAWiZkHiYACiZkHiYACiZkHiYACiZkHiYAHiZkHiYAHiZkFCYAFCZkFCYAFCZkFCYAFCZkHiYAWiZkHiYACiZkHiYACiZkHiYACiZkHiYAHiZkHiYAHiZkFCYAKCZkFCYAKCZkHiYAWiZkHiYACiZkHiYACiZkHiYACiZkHiYAHiZkHiYAHiZkFCYAKCZkFCYAKCZkHiYAWiZkHiYACiZkHiYACiZkHiYACiZkHiYAHiZkHiYAHiZkFCYAKCZkFCYAKCZkHiYAHiZkFCYACiZkFCYACiZkFCYAKCZkFCYACiZkFCYACiZkFCYAKCZkFCYACiZkFCYACiZkFCYACiZkFCYACiZkFCYACiZkFCYACiZkHiYAWiZkHiYACiZkHiYACiZkHiYACiZkHiYAHiZkHiYAHiZkFCYACiZkFCYACiZkFCYACiZkFCYACiZkHiYAWiZkHiYACiZkHiYACiZkHiYACiZkHiYAHiZkHiYAHiZkFCYAFCZkFCYAFCZkFCYAFCZkHiYAWiZkHiYACiZkHiYACiZkHiYACiZkHiYAHiZkHiYAHiZkFCYAFCZkFCYAFCZkFCYAFCZkHiYAWiZkHiYACiZkHiYACiZkHiYACiZkHiYAHiZkHiYAHiZkFCYAKCZkFCYAKCZkHiYAWiZkHiYACiZkHiYACiZkHiYACiZkHiYAHiZkHiYAHiZkFCYAKCZkFCYAKCZkHiYAWiZkHiYACiZkHiYACiZkHiYACiZkHiYAHiZkHiYAHiZkFCYAKCZkFCYAKCZkHiYAWiZkHiYACiZkHiYACiZkHiYACiZkHiYAHiZkHiYAHiZkFCYAKCZkFCYAKCZkHiYAHiZkFCYACiZkFCYACiZkFCYAKCZkFCYACiZkFCYACiZkFCYAKCZkFCYACiZkFCYACiZkFCYACiZkFCYACiZkFCYACiZkFCYACiZkHiYAWiZkHiYACiZkHiYACiZkHiYACiZkHiYAHiZkHiYAHiZkFCYACiZkFCYACiZkFCYACiZkFCYACiZkHiYAWiZkHiYACiZkHiYACiZkHiYACiZkHiYAHiZkHiYAHiZkFCYAFCZkFCYAFCZkFCYAFCZkHiYAWiZkHiYACiZkHiYACiZkHiYACiZkHiYAHiZkHiYAHiZkFCYAFCZkFCYAFCZkFCYAFCZkHiYAWiZkHiYACiZkHiYACiZkHiYACiZkHiYAHiZkHiYAHiZkFCYAKCZkFCYAKCZkHiYAWiZkHiYACiZkHiYACiZkHiYACLkHfwKZJmQAMWQeJgBVuQdkBZkxAAAmZB4mAFomZB4mAFomZB4mAAomZB4mAAomZB4mAAomZB4mAB4mZB4mAB4mZBQmABQmZBQmABQmZBQmABQmZB4mAFomZB4mAAomZB4mAAomZB4mAAi5B38CmSZkADFkHiYAVrkHZASZMQAAJmQeJgBaJmQeJgBaJmQeJgAKJmQeJgAKJmQeJgAKJmQeJgAeJmQeJgAeJmQUJgAUJmQUJgAUJmQUJgAUJmQeJgBaJmQeJgAKJmQeJgAKJmQeJgAKJmQeJgAeJmQeJgAeJmQUJgAoJmQUJgAoJmQeJgBaJmQeJgAKJmQeJgAKJmQeJgAKJmQeJgAeJmQeJgAeJmQUJgAoJmQUJgAoJmQeJgBaJmQeJgAKJmQeJgAKJmQeJgAKJmQeJgAeJmQeJgAeJmQUJgAoJmQUJgAoJmQeJgAeJmQUJgAKJmQUJgAKJmQUJgAoJmQUJgAKJmQUJgAKJmQUJgAoJmQUJgAKJmQUJgAKJmQUJgAKJmQUJgAKJmQUJgAKJmQUJgAA/y8ATVRyawAAA1gA/yEBAAD/AwpCYWNrZ3JvdW5kAMI/ALIHWo8Akj5kPD4APDpkeDoAADVkgXA1AAA4ZHg4AAA8ZB48AAo9ZB49AAo/ZB4/AApBZIJoQQAAPWQePQAKPWQePQAKPGQePAAKPWR4PQAANmR4NgAANWR4NQAAOGR4OAAANWSBcDUAADZkeDYAADZkHjYACjZkHjYACjhkHjgACjpkeDoAADhkPDgAADZkPDYAADVkeDUAADVkHjUACjVkHjUACjZkHjYACjhkeDgAADZkPDYAADVkPDUAADRkeDQAADRkHjQACjRkHjQACjVkHjUACjdkeDcAADpkeDoAADlkg2A5AAA+ZDw+ADw6ZHg6AAA1ZIFwNQAAOGR4OAAAPGQePAAKPWQePQAKP2QePwAKQWSCaEEAAD1kHj0ACj1kHj0ACjxkHjwACj1keD0AADZkeDYAADVkgXA1AAA5ZIFwOQAAOmSCXjoACj1keD0AADlkADVkg2A1AAA5AAA6ZIJeOgAKPWR4PQAAOWQANWSDYDUAADkAADZkg1Y2AAo1ZINWNQAKNGR4NAAAN2SBcDcAADpkeDoAADlkg2A5AAA+ZDw+ADw6ZHg6AAA1ZIFwNQAAOGR4OAAAPGQePAAKPWQePQAKP2QePwAKQWSCaEEAAD1kHj0ACj1kHj0ACjxkHjwACj1keD0AADZkeDYAADVkeDUAADhkeDgAADVkgXA1AAA2ZHg2AAA2ZB42AAo2ZB42AAo4ZB44AAo6ZHg6AAA4ZDw4AAA2ZDw2AAA1ZHg1AAA1ZB41AAo1ZB41AAo2ZB42AAo4ZHg4AAA2ZDw2AAA1ZDw1AAA0ZHg0AAA0ZB40AAo0ZB40AAo1ZB41AAo3ZHg3AAA6ZHg6AAA5ZINgOQAAPmQ8PgA8OmR4OgAANWSBcDUAADhkeDgAADxkHjwACj1kHj0ACj9kHj8ACkFkgmhBAAA9ZB49AAo9ZB49AAo8ZB48AAo9ZHg9AAA2ZHg2AAA1ZIFwNQAAOWSBcDkAADpkgl46AAo9ZHg9AAA5ZAA1ZINgNQAAOQAAOmSCXjoACj1keD0AADlkADVkg2A1AAA5AAA2ZINWNgAKNWSDVjUACjRkeDQAADdkgXA3AAA6ZHg6AAA5ZINgOQAA/y8ATVRyawAAAAkA/yEBAAD/LwBNVHJrAAAAJgD/IQEAAP8DGVplbGRhIDMgT3ZlcndvcmxkIE11c2ljIDEA/y8ATVRyawAAABoA/yEBAAD/Aw1TZXF1ZW5jZWQgYnk6AP8vAE1UcmsAAAAZAP8hAQAA/wMMZXJpa0B2YmUuY29tAP8vAA==";
    var camera, scene, attributes, uniforms, group, sparksEmitter, stats, emitters,
    renderer, delta = 1, windowHalfX, windowHalfY, targetRotation, targetRotationOnMouseDown, mouseXOnMouseDown=0;
    targetRotation = targetRotationOnMouseDown = 0;
    function init() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.set(0, 15, 140);
        scene = new THREE.Scene();
        var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set( 0, -1, 1 );
    directionalLight.position.normalize();
    scene.add( directionalLight );

    var pointLight = new THREE.PointLight( 0xffffff, 2, 300 );
    pointLight.position.set( 0, 0, 0 );
    scene.add( pointLight );
        group = new THREE.Group();
        scene.add( group );
        
        var Pool = {
            __pools: [],
            get: function() {
                if ( this.__pools.length > 0 ) {
                    return this.__pools.pop();
                }
                console.log( "pool ran out!" );
                return null;
            },
            add: function( v ) {
                this.__pools.push( v );
            }
        };

        var particlesLength = 70000;
        var particles = new THREE.Geometry();
        for ( i = 0; i < particlesLength; i ++ ) {

            particles.vertices.push(new THREE.Vector3( Math.random() * 200 - 100
                                                     , Math.random() * 100 + 150
                                                     , Math.random() * 50 ));
            Pool.add( i );
        }

        var sprite = generateSprite();
        texture = new THREE.Texture(sprite);
    texture.needsUpdate = true;

        attributes = {
            size: { type: 'f', value: [] },
            pcolor: { type: 'c', value: [] }
        };
        uniforms = {
            texture: { type: 't', value: texture }
        };
        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            attributes: attributes,

            vertexShader: document.getElementById( 'vertexshader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

        blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true
        });
        particleCloud = new THREE.PointCloud( particles, shaderMaterial );
        var vertices = particleCloud.geometry.vertices;
        var values_size = attributes.size.value;
        var values_color = attributes.pcolor.value;

        for(var v = 0; v < vertices.length; v++) {
            values_size[v] = 50;
            values_color[v] = new THREE.Color(0x000000);
            var inf = Number.POSITIVE_INFINITY;
            particles.vertices[v].set(inf, inf, inf);
        }

        group.add(particleCloud);
        particleCloud.y = 800;

        var plane = new THREE.PlaneGeometry()

        var hue = 0;

    var setTargetParticle = function() {
        var target = Pool.get();
        values_size[target] = 2 + Math.random() * 5;
        return target;
    };

    var onParticleCreated = function( p ) {
    var position = p.position;
    p.target.position = position;

    var target = p.target;
    if ( target ) {
        //  console.log(target,particles.vertices[target]);
        // values_size[target]
        // values_color[target]
        hue += 0.0003 * delta;
        if ( hue > 1 )
        hue -= 1;

        // TODO Create a PointOnShape Action/Zone in the particle engine

        //timeOnShapePath += 0.00035 * delta;
        //if ( timeOnShapePath > 1 ) timeOnShapePath -= 1;

        //var pointOnShape = heartShape.getPointAt( timeOnShapePath );

        //emitterpos.x = pointOnShape.x * 5 - 100;
        //emitterpos.y = -pointOnShape.y * 5 + 400;

        // pointLight.position.copy( emitterpos );
/*        pointLight.position.x = emitterpos.x;
        pointLight.position.y = emitterpos.y;
        pointLight.position.z = 100; */

        particles.vertices[ target ] = p.position;
/*      console.log("Set " + target + " to position ");
        console.log(p.position); */

        values_color[ target ].setHSL( hue, 1, 0.5 );

        pointLight.color.setHSL( hue, 1, 1 );
    };
    };

    var onParticleDead = function( particle ) {
        var target = particle.target;
        if ( target ) {
            // Hide the particle
            values_color[ target ].setRGB( 0, 0, 0 );
            particles.vertices[ target ].set( Number.POSITIVE_INFINITY,
                              Number.POSITIVE_INFINITY,
                              Number.POSITIVE_INFINITY );
            // Mark particle system as available by returning to pool
            Pool.add( particle.target );
        }
    };

        function createEmitter(emitterpos, speed) {
            sparksEmitter = new SPARKS.Emitter( new SPARKS.SteadyCounter( 500 ) );
            sparksEmitter.addInitializer( new SPARKS.Position( new SPARKS.LineZone( emitterpos, (new THREE.Vector3(0, 3, 0).add(emitterpos) ) ) ));
            sparksEmitter.addInitializer( new SPARKS.Lifetime( 0.4, 0.7 ) );
            sparksEmitter.addInitializer( new SPARKS.Target( null, setTargetParticle ) );


            sparksEmitter.addInitializer( new SPARKS.Velocity( new SPARKS.PointZone( speed ) ) );

            sparksEmitter.addAction( new SPARKS.Age() );
            sparksEmitter.addAction( new SPARKS.Accelerate( 0, -250, 0 ) );
            sparksEmitter.addAction( new SPARKS.Move() );
            sparksEmitter.addAction( new SPARKS.RandomDrift( 500, 500, 500 ) );

            sparksEmitter.addCallback( "created", onParticleCreated );
            sparksEmitter.addCallback( "dead", onParticleDead );
            sparksEmitter.stopEmitting();
            sparksEmitter.start();
            return sparksEmitter;
        }

        emitters = [];
        var n = 28;
        var ang = 2*Math.PI / n;
        var frad = 40;
        var srad = 60;
        for(var i=0; i<n; i++) {
            var angle = ang*i;
            emitters.push(createEmitter(new THREE.Vector3(frad*Math.cos(angle), 0, frad*Math.sin(angle)),
                                        new THREE.Vector3(-srad*Math.cos(angle), 110, -srad*Math.sin(angle))));
        }
        
        // End Particles

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.getElementById('container').appendChild( renderer.domElement );

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        container.appendChild( stats.domElement );

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'mousedown', onDocumentMouseDown, false );
        document.addEventListener( 'touchstart', onDocumentTouchStart, false );
        document.addEventListener( 'touchmove', onDocumentTouchMove, false );
        window.addEventListener( 'resize', onWindowResize, false);
    }
    
    function animate() {
        requestAnimationFrame( animate );
        render();
        stats.update();
    }
    
    var speed = 50;
    var clock = new THREE.Clock();
    function render() {
        delta = speed * clock.getDelta();
        
        particleCloud.geometry.verticesNeedUpdate = true;
        
        attributes.size.needsUpdate = true;
        attributes.pcolor.needsUpdate = true;
        
        // Pretty cool effect if you enable this
        // particleCloud.rotation.y += 0.05;
        
        group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;
        
        renderer.clear();
        
        renderer.render( scene, camera );
        // composer.render( 0.1 );
    }

    function onload() {
        var MESSAGE_START = 128;
        var MESSAGE_END = 144;
        MIDI.loadPlugin({
            soundFontUrl: "../MIDI.js/examples/soundfont/",
            onprogress: function(state, progress) {
                document.title.innerHTML = progress * 100;
            },
            onsuccess: function() {
                var player = MIDI.Player;
                player.timeWarp = 1;
                player.loadFile(tetris);
                // tetris plays notes from 36 to 81
                player.addListener(function(data) {
                    var e = emitters[data.note % 28];
                    if(data.message == MESSAGE_START) {
                        e.startEmitting();
                        setTimeout(function(){e.stopEmitting();}, 250);
                    } else {
                        e.stopEmitting();
                    }
                    if(data.now == data.end)
                        player.resume();
                });
                player.resume();
            }
        });
        init();
        animate();
    };
    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );
    }


    function onDocumentMouseDown( event ) {
        event.preventDefault();

        mouseXOnMouseDown = event.clientX - windowHalfX;
        targetRotationOnMouseDown = targetRotation;

        if ( sparksEmitter.isRunning() ) {
            sparksEmitter.stop();
        } else {
            sparksEmitter.start();
        }

    }

    function onDocumentMouseMove( event ) {
        mouseX = event.clientX - windowHalfX;

        targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;

    }

    function onDocumentTouchStart( event ) {

        if ( event.touches.length === 1 ) {

            event.preventDefault();

            mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
            targetRotationOnMouseDown = targetRotation;

        }

    }

    function onDocumentTouchMove( event ) {

        if ( event.touches.length === 1 ) {

            event.preventDefault();

            mouseX = event.touches[ 0 ].pageX - windowHalfX;
            targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;

        }

    }
    window.addEventListener('load', onload, false);
})(window, jQuery, MIDI, THREE, SPARKS)
