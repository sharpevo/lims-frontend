import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'

@Component({
  selector: 'redirect-component',
  template: '',
})

export class RedirectComponent{

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ){}

  ngOnInit() {
    let url = this.route.snapshot.url
    console.log('redirect', url, this.route)
    console.log("SEG", url.map(seg => '/' + seg.path))
    this.router.navigate(url.map((seg) => '/' + seg.path))
  }
}
